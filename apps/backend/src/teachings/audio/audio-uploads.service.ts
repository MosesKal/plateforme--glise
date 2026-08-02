import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AudioMediaAsset, Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { createHash, randomUUID } from 'crypto';
import { createReadStream, promises as fs } from 'fs';
import { basename, extname } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { MediaProbeService } from './media-probe.service';

const STAGED_UPLOAD_TTL_MS = 24 * 60 * 60 * 1000;
const EXTENSION_BY_MIME_TYPE: Readonly<Record<string, string>> = {
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/aac': '.aac',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/flac': '.flac',
  'audio/webm': '.webm',
};

export function extensionForAudioMimeType(mimeType: string): string | null {
  return EXTENSION_BY_MIME_TYPE[mimeType] ?? null;
}

export interface StagedAudioUploadResult {
  uploadId: string;
  fileSize: number;
  mimeType: string;
  durationSec: number;
  expiresAt: Date | null;
}

export interface ClaimedAudioUpload {
  asset: AudioMediaAsset;
  finalKey: string;
}

export interface RegisterStoredAudioInput {
  stagingKey: string;
  originalName: string;
  detectedMimeType: string;
  fileSize: number;
  durationSec: number;
}

@Injectable()
export class AudioUploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaProbe: MediaProbeService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async stage(
    file: Express.Multer.File | undefined,
    userId: string,
    clientUploadId?: string,
  ): Promise<StagedAudioUploadResult> {
    if (!file) {
      throw new BadRequestException({
        code: 'AUDIO_FILE_MISSING',
        message: 'Aucun fichier reçu',
      });
    }
    if (clientUploadId && !isUUID(clientUploadId, '4')) {
      await this.deleteTemporaryFile(file.path);
      throw new BadRequestException({
        code: 'INVALID_UPLOAD_ID',
        message: 'Identifiant d’upload invalide',
      });
    }
    if (clientUploadId) {
      const existing = await this.prisma.audioMediaAsset.findUnique({
        where: { id: clientUploadId },
      });
      if (existing) {
        await this.deleteTemporaryFile(file.path);
        this.assertOwner(existing, userId);
        this.assertNotExpired(existing);
        return this.toResult(existing);
      }
    }
    if (!this.mediaProbe.isAvailable()) {
      await this.deleteTemporaryFile(file.path);
      throw new ServiceUnavailableException({
        code: 'FFPROBE_UNAVAILABLE',
        message: 'La validation audio est temporairement indisponible',
      });
    }

    let storedKey: string | null = null;
    try {
      const [probe, checksumSha256] = await Promise.all([
        this.mediaProbe.probe(file.path),
        this.sha256(file.path),
      ]);
      if (!probe) {
        throw new BadRequestException({
          code: 'INVALID_AUDIO',
          message: 'Le fichier ne contient pas de flux audio valide',
        });
      }
      const extension = extensionForAudioMimeType(probe.mimeType);
      if (!extension) {
        throw new BadRequestException({
          code: 'UNSUPPORTED_AUDIO_FORMAT',
          message: 'Le conteneur audio détecté n’est pas pris en charge',
        });
      }

      const id = clientUploadId ?? randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + STAGED_UPLOAD_TTL_MS);
      storedKey = `audio/staged/${now.getUTCFullYear()}/${String(
        now.getUTCMonth() + 1,
      ).padStart(2, '0')}/${id}-${randomUUID()}${extension}`;

      await this.storage.save(file.path, storedKey);

      try {
        await this.prisma.audioMediaAsset.create({
          data: {
            id,
            stagingKey: storedKey,
            originalName: basename(file.originalname).slice(0, 255),
            detectedMimeType: probe.mimeType,
            fileSize: file.size,
            durationSec: probe.durationSec,
            checksumSha256,
            status: 'STAGED',
            expiresAt,
            createdById: userId,
          },
        });
      } catch (error) {
        // L'erreur DB reste la cause principale. Si le nettoyage échoue, le
        // janitor retrouvera ce fichier staging non référencé après son TTL.
        await this.storage.delete(storedKey).catch(() => undefined);
        storedKey = null;
        if (
          clientUploadId &&
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          const existing = await this.prisma.audioMediaAsset.findUnique({
            where: { id: clientUploadId },
          });
          if (existing) {
            this.assertOwner(existing, userId);
            return this.toResult(existing);
          }
        }
        throw error;
      }

      return {
        uploadId: id,
        fileSize: file.size,
        mimeType: probe.mimeType,
        durationSec: probe.durationSec,
        expiresAt,
      };
    } finally {
      // `save` déplace le fichier : unlink devient alors un no-op ENOENT. Si
      // save échoue avant le déplacement, le temporaire est quand même purgé.
      await this.deleteTemporaryFile(file.path);
    }
  }

  async findUpload(
    uploadId: string,
    userId: string,
  ): Promise<StagedAudioUploadResult> {
    const asset = await this.prisma.audioMediaAsset.findUnique({
      where: { id: uploadId },
    });
    if (!asset) throw new NotFoundException('Upload audio introuvable');
    this.assertOwner(asset, userId);
    this.assertNotExpired(asset);
    return this.toResult(asset);
  }

  async registerStoredStaged(
    input: RegisterStoredAudioInput,
  ): Promise<{ uploadId: string }> {
    const localPath = this.storage.getLocalPath(input.stagingKey);
    if (!localPath) {
      throw new ServiceUnavailableException(
        'Le provider courant ne permet pas l’import local',
      );
    }
    const uploadId = randomUUID();
    await this.prisma.audioMediaAsset.create({
      data: {
        id: uploadId,
        stagingKey: input.stagingKey,
        originalName: basename(input.originalName).slice(0, 255),
        detectedMimeType: input.detectedMimeType,
        fileSize: input.fileSize,
        durationSec: input.durationSec,
        checksumSha256: await this.sha256(localPath),
        status: 'STAGED',
        expiresAt: new Date(Date.now() + STAGED_UPLOAD_TTL_MS),
      },
    });
    return { uploadId };
  }

  async findAttachedTeaching(uploadId: string) {
    return this.prisma.audioTeaching.findUnique({
      where: { mediaAssetId: uploadId },
      include: {
        theme: { select: { id: true, slug: true, nameFr: true, nameEn: true } },
        speaker: {
          select: { id: true, slug: true, fullName: true, title: true },
        },
        tags: { include: { tag: true } },
        mediaAsset: true,
      },
    });
  }

  async claimForPromotion(
    uploadId: string,
    userId: string,
  ): Promise<ClaimedAudioUpload> {
    const asset = await this.prisma.audioMediaAsset.findUnique({
      where: { id: uploadId },
    });
    if (!asset) throw new NotFoundException('Upload audio introuvable');
    if (asset.createdById && asset.createdById !== userId) {
      throw new ForbiddenException(
        'Cet upload appartient à un autre utilisateur',
      );
    }
    if (asset.expiresAt && asset.expiresAt <= new Date()) {
      throw new GoneException({
        code: 'AUDIO_UPLOAD_EXPIRED',
        message: 'Cet upload a expiré, veuillez renvoyer le fichier',
      });
    }
    if (!asset.stagingKey) {
      throw new ConflictException({
        code: 'AUDIO_UPLOAD_NOT_STAGED',
        message: 'Cet upload est déjà finalisé ou indisponible',
      });
    }

    const extension = extname(asset.stagingKey).toLowerCase() || '.audio';
    const finalKey = `audio/${new Date().getUTCFullYear()}/${asset.id}${extension}`;
    const { count } = await this.prisma.audioMediaAsset.updateMany({
      where: { id: asset.id, status: 'STAGED' },
      data: {
        status: 'PROMOTING',
        storageKey: finalKey,
        lastError: null,
      },
    });
    if (count === 0) {
      throw new ConflictException({
        code: 'AUDIO_UPLOAD_FINALIZING',
        message: 'Cet upload est déjà en cours de finalisation',
      });
    }

    return { asset, finalKey };
  }

  async promote(claim: ClaimedAudioUpload): Promise<void> {
    await this.storage.move(claim.asset.stagingKey as string, claim.finalKey);
  }

  completePromotion(tx: Prisma.TransactionClient, claim: ClaimedAudioUpload) {
    return tx.audioMediaAsset.update({
      where: { id: claim.asset.id },
      data: {
        status: 'PENDING',
        stagingKey: null,
        storageKey: claim.finalKey,
        expiresAt: null,
        lastError: null,
        nextAttemptAt: null,
      },
    });
  }

  async rollbackPromotion(
    claim: ClaimedAudioUpload,
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    try {
      if (await this.storage.exists(claim.finalKey)) {
        await this.storage.move(
          claim.finalKey,
          claim.asset.stagingKey as string,
        );
      }
      await this.prisma.audioMediaAsset.updateMany({
        where: { id: claim.asset.id, status: 'PROMOTING' },
        data: {
          status: 'STAGED',
          storageKey: null,
          lastError: message.slice(0, 2000),
        },
      });
    } catch (rollbackError) {
      await this.prisma.audioMediaAsset.updateMany({
        where: { id: claim.asset.id, status: 'PROMOTING' },
        data: {
          status: 'FAILED',
          lastError: `Rollback impossible: ${
            rollbackError instanceof Error
              ? rollbackError.message
              : String(rollbackError)
          }`.slice(0, 2000),
        },
      });
    }
  }

  async discard(uploadId: string, userId: string): Promise<{ id: string }> {
    const asset = await this.prisma.audioMediaAsset.findUnique({
      where: { id: uploadId },
      include: { teaching: { select: { id: true } } },
    });
    if (!asset) return { id: uploadId };
    if (asset.createdById && asset.createdById !== userId) {
      throw new ForbiddenException(
        'Cet upload appartient à un autre utilisateur',
      );
    }
    if (asset.teaching) {
      throw new ConflictException(
        'Cet upload est déjà rattaché à un enseignement',
      );
    }

    if (asset.stagingKey) await this.storage.delete(asset.stagingKey);
    if (asset.storageKey) await this.storage.delete(asset.storageKey);
    await this.prisma.audioMediaAsset.delete({ where: { id: asset.id } });
    return { id: asset.id };
  }

  private sha256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const input = createReadStream(filePath);
      input.on('error', reject);
      input.on('data', (chunk) => hash.update(chunk));
      input.on('end', () => resolve(hash.digest('hex')));
    });
  }

  private async deleteTemporaryFile(filePath: string): Promise<void> {
    await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }

  private assertOwner(asset: AudioMediaAsset, userId: string): void {
    if (asset.createdById && asset.createdById !== userId) {
      throw new ForbiddenException(
        'Cet upload appartient à un autre utilisateur',
      );
    }
  }

  private assertNotExpired(asset: AudioMediaAsset): void {
    if (
      asset.status === 'EXPIRED' ||
      (asset.expiresAt && asset.expiresAt <= new Date())
    ) {
      throw new GoneException({
        code: 'AUDIO_UPLOAD_EXPIRED',
        message: 'Cet upload a expiré, veuillez renvoyer le fichier',
      });
    }
  }

  private toResult(asset: AudioMediaAsset): StagedAudioUploadResult {
    return {
      uploadId: asset.id,
      fileSize: asset.fileSize,
      mimeType: asset.detectedMimeType,
      durationSec: asset.durationSec,
      expiresAt: asset.expiresAt,
    };
  }
}
