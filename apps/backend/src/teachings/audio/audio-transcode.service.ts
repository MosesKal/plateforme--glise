import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { getUploadTmpDir } from '../../storage/storage.config';
import { MediaProbeService } from './media-probe.service';

const execFileAsync = promisify(execFile);
const OPTIMIZED_SUFFIX = '-96k.m4a';
const FFMPEG_TIMEOUT_MS = 20 * 60 * 1000;
const PROCESSING_LEASE_MS = 25 * 60 * 1000;
const RECOVERY_INTERVAL_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 15 * 60 * 1000;

/**
 * Worker audio durable : la file locale ne sert qu'à réveiller le worker. Le
 * verrou réel est une lease atomique stockée dans PostgreSQL, ce qui empêche
 * deux processus (reload PM2, déploiement progressif, future réplication) de
 * transcoder ou supprimer le même média simultanément.
 */
@Injectable()
export class AudioTranscodeService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AudioTranscodeService.name);
  private readonly ffmpegPath = process.env.FFMPEG_PATH?.trim() || 'ffmpeg';
  private readonly queue: string[] = [];
  private draining = false;
  private ffmpegAvailable = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaProbe: MediaProbeService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  onApplicationBootstrap(): void {
    void this.recoverRunnableJobs();
  }

  enqueue(teachingId: string): void {
    if (this.queue.includes(teachingId)) return;
    this.queue.push(teachingId);
    void this.drain();
  }

  async retry(teachingId: string): Promise<{ ok: true }> {
    const teaching = await this.prisma.audioTeaching.findUnique({
      where: { id: teachingId },
      select: { mediaAssetId: true, mediaAsset: { select: { status: true } } },
    });
    const mediaAssetId = teaching?.mediaAssetId;
    if (!mediaAssetId) {
      throw new NotFoundException('Média audio introuvable');
    }
    if (teaching.mediaAsset?.status !== 'FAILED') {
      throw new ConflictException(
        'Seul un transcodage en échec peut être relancé manuellement',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      const reset = await tx.audioMediaAsset.updateMany({
        where: { id: mediaAssetId, status: 'FAILED' },
        data: {
          status: 'PENDING',
          attempts: 0,
          lastError: null,
          nextAttemptAt: null,
          leaseId: null,
          leaseExpiresAt: null,
        },
      });
      if (reset.count === 0) {
        throw new ConflictException(
          'Le statut du transcodage a changé, rechargez la page',
        );
      }
      await tx.audioTeaching.update({
        where: { id: teachingId },
        data: { processing: 'PENDING' },
      });
    });
    this.enqueue(teachingId);
    return { ok: true };
  }

  @Interval(RECOVERY_INTERVAL_MS)
  async recoverRunnableJobs(): Promise<void> {
    const now = new Date();
    try {
      await this.finalizeExhaustedLeases(now);
      const assets = await this.prisma.audioMediaAsset.findMany({
        where: {
          teaching: { isNot: null },
          OR: [
            { status: 'PENDING', attempts: { lt: MAX_ATTEMPTS } },
            {
              status: 'FAILED',
              attempts: { lt: MAX_ATTEMPTS },
              OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
            },
            {
              status: 'PROCESSING',
              attempts: { lt: MAX_ATTEMPTS },
              OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lte: now } }],
            },
          ],
        },
        select: { teaching: { select: { id: true } } },
        orderBy: { updatedAt: 'asc' },
      });
      for (const asset of assets) {
        if (asset.teaching) this.enqueue(asset.teaching.id);
      }
    } catch (error) {
      this.logger.error(
        `Récupération des transcodages impossible : ${this.errorMessage(error)}`,
      );
    }
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      let id: string | undefined;
      while ((id = this.queue.shift()) !== undefined) {
        try {
          await this.processOne(id);
        } catch (error) {
          this.logger.error(
            `Job de transcodage ${id} interrompu : ${this.errorMessage(error)}`,
          );
        }
      }
    } finally {
      this.draining = false;
    }
  }

  private async processOne(teachingId: string): Promise<void> {
    const teaching = await this.prisma.audioTeaching.findUnique({
      where: { id: teachingId },
      select: {
        id: true,
        mediaAsset: true,
      },
    });
    const asset = teaching?.mediaAsset;
    if (!teaching || !asset?.storageKey) return;

    const now = new Date();
    const leaseId = randomUUID();
    const { count } = await this.prisma.audioMediaAsset.updateMany({
      where: {
        id: asset.id,
        OR: [
          { status: 'PENDING', attempts: { lt: MAX_ATTEMPTS } },
          {
            status: 'FAILED',
            attempts: { lt: MAX_ATTEMPTS },
            OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
          },
          {
            status: 'PROCESSING',
            attempts: { lt: MAX_ATTEMPTS },
            OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lte: now } }],
          },
        ],
      },
      data: {
        status: 'PROCESSING',
        leaseId,
        leaseExpiresAt: new Date(now.getTime() + PROCESSING_LEASE_MS),
        attempts: { increment: 1 },
        lastError: null,
        nextAttemptAt: null,
      },
    });
    if (count === 0) return;

    const sourceKey = asset.storageKey;
    if (sourceKey.endsWith(OPTIMIZED_SUFFIX)) {
      await this.markReadyOnOriginal(asset.id, teaching.id, sourceKey, leaseId);
      return;
    }

    if (!(await this.isFfmpegAvailable())) {
      await this.markFailure(
        asset.id,
        teaching.id,
        sourceKey,
        leaseId,
        asset.attempts + 1,
        new Error('ffmpeg indisponible'),
      );
      return;
    }

    const sourcePath = this.storage.getLocalPath(sourceKey);
    if (!sourcePath) {
      await this.markFailure(
        asset.id,
        teaching.id,
        sourceKey,
        leaseId,
        asset.attempts + 1,
        new Error('Le provider ne fournit pas de chemin local'),
      );
      return;
    }

    const tmpDir = getUploadTmpDir();
    const tmpOut = join(tmpDir, `${randomUUID()}.m4a`);
    const targetKey = `${sourceKey.replace(/\.[a-z0-9]+$/i, '')}-${leaseId}${OPTIMIZED_SUFFIX}`;
    let targetSaved = false;

    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await execFileAsync(
        this.ffmpegPath,
        [
          '-hide_banner',
          '-loglevel',
          'error',
          '-y',
          '-i',
          sourcePath,
          '-vn',
          '-map_metadata',
          '0',
          '-c:a',
          'aac',
          '-b:a',
          '96k',
          '-movflags',
          '+faststart',
          tmpOut,
        ],
        { timeout: FFMPEG_TIMEOUT_MS, windowsHide: true },
      );

      const [probe, stat] = await Promise.all([
        this.mediaProbe.probe(tmpOut),
        fs.stat(tmpOut),
      ]);
      if (!probe) throw new Error('Le fichier transcodé est invalide');

      await this.storage.save(tmpOut, targetKey);
      targetSaved = true;

      const swapped = await this.prisma.$transaction(async (tx) => {
        const claimed = await tx.audioMediaAsset.updateMany({
          where: { id: asset.id, status: 'PROCESSING', leaseId },
          data: {
            storageKey: targetKey,
            obsoleteStorageKey: sourceKey,
            detectedMimeType: 'audio/mp4',
            fileSize: stat.size,
            durationSec: probe.durationSec,
            status: 'READY',
            leaseId: null,
            leaseExpiresAt: null,
            lastError: null,
            nextAttemptAt: null,
          },
        });
        if (claimed.count === 0) return false;

        await tx.audioTeaching.updateMany({
          where: { id: teaching.id, mediaAssetId: asset.id },
          data: {
            fileKey: targetKey,
            mimeType: 'audio/mp4',
            fileSize: stat.size,
            durationSec: probe.durationSec,
            processing: 'READY',
          },
        });
        return true;
      });

      if (!swapped) {
        await this.storage
          .delete(targetKey)
          .catch((error) =>
            this.logger.warn(
              `Cible de lease expirée à nettoyer (${targetKey}) : ${this.errorMessage(error)}`,
            ),
          );
        return;
      }

      // Le swap DB est confirmé : une impossibilité de supprimer l'original
      // ne doit jamais provoquer la suppression compensatoire de la cible.
      targetSaved = false;
      await this.deleteObsoleteIfUnreferenced(asset.id, targetKey, sourceKey);
      this.logger.log(`Transcodage terminé : ${sourceKey} → ${targetKey}`);
    } catch (error) {
      await fs.unlink(tmpOut).catch(() => undefined);
      if (targetSaved) {
        await this.storage
          .delete(targetKey)
          .catch((cleanupError) =>
            this.logger.warn(
              `Cible partielle à nettoyer (${targetKey}) : ${this.errorMessage(cleanupError)}`,
            ),
          );
      }
      await this.markFailure(
        asset.id,
        teaching.id,
        sourceKey,
        leaseId,
        asset.attempts + 1,
        error,
      );
    }
  }

  private async markReadyOnOriginal(
    assetId: string,
    teachingId: string,
    sourceKey: string,
    leaseId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.audioMediaAsset.updateMany({
        where: { id: assetId, storageKey: sourceKey, leaseId },
        data: {
          status: 'READY',
          leaseId: null,
          leaseExpiresAt: null,
          nextAttemptAt: null,
        },
      });
      if (updated.count > 0) {
        await tx.audioTeaching.updateMany({
          where: { id: teachingId, mediaAssetId: assetId },
          data: { processing: 'READY' },
        });
      }
    });
  }

  private async finalizeExhaustedLeases(now: Date): Promise<void> {
    const exhausted = await this.prisma.audioMediaAsset.findMany({
      where: {
        status: 'PROCESSING',
        attempts: { gte: MAX_ATTEMPTS },
        OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lte: now } }],
        teaching: { isNot: null },
      },
      select: { id: true, leaseId: true, teaching: { select: { id: true } } },
    });

    for (const asset of exhausted) {
      const teachingId = asset.teaching?.id;
      if (!teachingId) continue;
      await this.prisma.$transaction(async (tx) => {
        const failed = await tx.audioMediaAsset.updateMany({
          where: {
            id: asset.id,
            status: 'PROCESSING',
            leaseId: asset.leaseId,
            attempts: { gte: MAX_ATTEMPTS },
            OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lte: now } }],
          },
          data: {
            status: 'FAILED',
            leaseId: null,
            leaseExpiresAt: null,
            nextAttemptAt: null,
            lastError: 'Worker interrompu pendant la dernière tentative',
          },
        });
        if (failed.count > 0) {
          await tx.audioTeaching.updateMany({
            where: { id: teachingId, mediaAssetId: asset.id },
            data: { processing: 'FAILED' },
          });
        }
      });
    }
  }

  private async deleteObsoleteIfUnreferenced(
    assetId: string,
    currentKey: string,
    obsoleteKey: string,
  ): Promise<void> {
    try {
      const [otherAssets, teachings] = await Promise.all([
        this.prisma.audioMediaAsset.count({
          where: {
            id: { not: assetId },
            OR: [
              { storageKey: obsoleteKey },
              { stagingKey: obsoleteKey },
              { obsoleteStorageKey: obsoleteKey },
            ],
          },
        }),
        this.prisma.audioTeaching.count({ where: { fileKey: obsoleteKey } }),
      ]);
      if (otherAssets === 0 && teachings === 0) {
        await this.storage.delete(obsoleteKey);
      }
      await this.prisma.audioMediaAsset.updateMany({
        where: {
          id: assetId,
          storageKey: currentKey,
          obsoleteStorageKey: obsoleteKey,
        },
        data: { obsoleteStorageKey: null },
      });
    } catch (error) {
      this.logger.warn(
        `Original à nettoyer ultérieurement (${obsoleteKey}) : ${this.errorMessage(error)}`,
      );
    }
  }

  private async markFailure(
    assetId: string,
    teachingId: string,
    sourceKey: string,
    leaseId: string,
    attempt: number,
    error: unknown,
  ): Promise<void> {
    const retryAt =
      attempt < MAX_ATTEMPTS
        ? new Date(Date.now() + RETRY_DELAY_MS * attempt)
        : null;
    const message = this.errorMessage(error).slice(0, 2000);
    this.logger.error(`Transcodage échoué pour "${sourceKey}" : ${message}`);

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.audioMediaAsset.updateMany({
        where: { id: assetId, storageKey: sourceKey, leaseId },
        data: {
          status: 'FAILED',
          lastError: message,
          nextAttemptAt: retryAt,
          leaseId: null,
          leaseExpiresAt: null,
        },
      });
      if (updated.count > 0) {
        await tx.audioTeaching.updateMany({
          where: { id: teachingId, mediaAssetId: assetId },
          data: { processing: 'FAILED' },
        });
      }
    });
  }

  private async isFfmpegAvailable(): Promise<boolean> {
    if (this.ffmpegAvailable) return true;
    try {
      await execFileAsync(this.ffmpegPath, ['-version'], {
        timeout: 5_000,
        windowsHide: true,
      });
      this.ffmpegAvailable = true;
    } catch {
      this.ffmpegAvailable = false;
    }
    return this.ffmpegAvailable;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
