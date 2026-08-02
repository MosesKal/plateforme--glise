import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { promises as fs } from 'fs';
import { join, relative, sep } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../storage/storage-provider.interface';
import type { StorageProvider } from '../../storage/storage-provider.interface';
import { getUploadTmpDir } from '../../storage/storage.config';

const PROMOTION_STALE_MS = 15 * 60 * 1000;
const ORPHAN_GRACE_MS = 60 * 60 * 1000;
const TEMP_FILE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AudioMediaCleanupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AudioMediaCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  onApplicationBootstrap(): void {
    void this.runMaintenance();
  }

  @Cron('0 * * * *')
  async runMaintenance(): Promise<void> {
    try {
      await this.recoverStalePromotions();
      await this.deleteExpiredStagedUploads();
      await this.deleteOrphanAssets();
      await this.deleteObsoleteFiles();
      await this.deleteUntrackedStagedFiles();
      await this.deleteOldTemporaryFiles();
    } catch (error) {
      this.logger.error(
        `Maintenance audio interrompue : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async recoverStalePromotions(): Promise<void> {
    const staleBefore = new Date(Date.now() - PROMOTION_STALE_MS);
    const assets = await this.prisma.audioMediaAsset.findMany({
      where: { status: 'PROMOTING', updatedAt: { lte: staleBefore } },
      include: { teaching: { select: { id: true } } },
    });

    for (const asset of assets) {
      try {
        const finalExists = asset.storageKey
          ? await this.storage.exists(asset.storageKey)
          : false;
        const stagedExists = asset.stagingKey
          ? await this.storage.exists(asset.stagingKey)
          : false;

        if (asset.teaching && finalExists) {
          await this.prisma.audioMediaAsset.update({
            where: { id: asset.id },
            data: {
              status: 'PENDING',
              stagingKey: null,
              expiresAt: null,
              lastError: 'Finalisation récupérée après interruption',
            },
          });
          continue;
        }

        if (!asset.teaching && asset.stagingKey) {
          if (finalExists && asset.storageKey) {
            await this.storage.move(asset.storageKey, asset.stagingKey);
          }
          if (stagedExists || finalExists) {
            await this.prisma.audioMediaAsset.update({
              where: { id: asset.id },
              data: {
                status: 'STAGED',
                storageKey: null,
                lastError: 'Finalisation annulée après interruption',
              },
            });
            continue;
          }
        }

        await this.prisma.audioMediaAsset.update({
          where: { id: asset.id },
          data: {
            status: 'FAILED',
            lastError: 'Fichier introuvable après une finalisation interrompue',
          },
        });
      } catch (error) {
        this.logger.error(
          `Récupération de l'asset ${asset.id} impossible : ${this.errorMessage(error)}`,
        );
      }
    }
  }

  private async deleteExpiredStagedUploads(): Promise<void> {
    const expired = await this.prisma.audioMediaAsset.findMany({
      where: {
        status: { in: ['STAGED', 'EXPIRED'] },
        expiresAt: { lte: new Date() },
        teaching: { is: null },
      },
    });
    for (const asset of expired) {
      try {
        if (asset.stagingKey) await this.storage.delete(asset.stagingKey);
        if (asset.storageKey) await this.storage.delete(asset.storageKey);
        if (asset.obsoleteStorageKey) {
          await this.storage.delete(asset.obsoleteStorageKey);
        }
        await this.prisma.audioMediaAsset.delete({ where: { id: asset.id } });
      } catch (error) {
        this.logger.error(
          `Suppression de l'upload expiré ${asset.id} impossible : ${this.errorMessage(error)}`,
        );
      }
    }
  }

  private async deleteOrphanAssets(): Promise<void> {
    const orphaned = await this.prisma.audioMediaAsset.findMany({
      where: {
        teaching: { is: null },
        status: { notIn: ['STAGED', 'PROMOTING'] },
        updatedAt: { lte: new Date(Date.now() - ORPHAN_GRACE_MS) },
      },
    });
    for (const asset of orphaned) {
      try {
        if (asset.stagingKey) await this.storage.delete(asset.stagingKey);
        if (asset.storageKey) await this.storage.delete(asset.storageKey);
        if (asset.obsoleteStorageKey) {
          await this.storage.delete(asset.obsoleteStorageKey);
        }
        await this.prisma.audioMediaAsset.delete({ where: { id: asset.id } });
      } catch (error) {
        this.logger.error(
          `Suppression de l'asset orphelin ${asset.id} impossible : ${this.errorMessage(error)}`,
        );
      }
    }
  }

  private async deleteObsoleteFiles(): Promise<void> {
    const assets = await this.prisma.audioMediaAsset.findMany({
      where: { obsoleteStorageKey: { not: null } },
      select: { id: true, obsoleteStorageKey: true },
    });
    for (const asset of assets) {
      const key = asset.obsoleteStorageKey;
      if (!key) continue;
      try {
        const [otherAssets, teachings] = await Promise.all([
          this.prisma.audioMediaAsset.count({
            where: {
              id: { not: asset.id },
              OR: [
                { storageKey: key },
                { stagingKey: key },
                { obsoleteStorageKey: key },
              ],
            },
          }),
          this.prisma.audioTeaching.count({ where: { fileKey: key } }),
        ]);
        if (otherAssets === 0 && teachings === 0) {
          await this.storage.delete(key);
        }
        await this.prisma.audioMediaAsset.updateMany({
          where: { id: asset.id, obsoleteStorageKey: key },
          data: { obsoleteStorageKey: null },
        });
      } catch (error) {
        this.logger.error(
          `Suppression de l'ancien original ${key} impossible : ${this.errorMessage(error)}`,
        );
      }
    }
  }

  /**
   * Couvre le crash très étroit situé entre l'écriture du fichier et la
   * création de l'asset en base. Sans cette réconciliation, aucun enregistrement
   * ne permettrait au nettoyage classique de retrouver le fichier.
   */
  private async deleteUntrackedStagedFiles(): Promise<void> {
    const stagedRoot = this.storage.getLocalPath('audio/staged');
    if (!stagedRoot) return;

    const referencedRows = await this.prisma.audioMediaAsset.findMany({
      where: { stagingKey: { not: null } },
      select: { stagingKey: true },
    });
    const referenced = new Set(
      referencedRows.flatMap(({ stagingKey }) =>
        stagingKey ? [stagingKey] : [],
      ),
    );
    const threshold = Date.now() - TEMP_FILE_TTL_MS;

    for (const path of await this.listFiles(stagedRoot)) {
      try {
        const stat = await fs.stat(path);
        if (stat.mtimeMs > threshold) continue;

        const suffix = relative(stagedRoot, path).split(sep).join('/');
        const key = `audio/staged/${suffix}`;
        if (!referenced.has(key)) await this.storage.delete(key);
      } catch (error) {
        this.logger.error(
          `Nettoyage du fichier staging ${path} impossible : ${this.errorMessage(error)}`,
        );
      }
    }
  }

  private async deleteOldTemporaryFiles(): Promise<void> {
    const directory = getUploadTmpDir();
    const entries = await fs
      .readdir(directory, { withFileTypes: true })
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
    const threshold = Date.now() - TEMP_FILE_TTL_MS;
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const path = join(directory, entry.name);
      const stat = await fs.stat(path);
      if (stat.mtimeMs <= threshold) await fs.unlink(path);
    }
  }

  private async listFiles(directory: string): Promise<string[]> {
    const entries = await fs
      .readdir(directory, { withFileTypes: true })
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
    const files: string[] = [];
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) files.push(...(await this.listFiles(path)));
      else if (entry.isFile()) files.push(path);
    }
    return files;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
