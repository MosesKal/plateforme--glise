import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { getPublicBaseUrl } from '../common/config/app-url';
import { StorageProvider } from './storage-provider.interface';
import { getMediaRoot } from './storage.config';

/**
 * Stockage sur le disque local du VPS.
 *
 * Les fichiers vivent dans MEDIA_ROOT (hors de l'arborescence applicative en
 * production) et sont servis sous /media/ — par Nginx en production (sendfile,
 * Range natif), par le fallback statique de main.ts en développement.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly root = getMediaRoot();

  async save(tempPath: string, key: string): Promise<void> {
    const target = this.getLocalPath(key)!;
    await fs.mkdir(dirname(target), { recursive: true });
    try {
      await fs.rename(tempPath, target);
    } catch (err: unknown) {
      // rename échoue entre volumes différents (EXDEV) → copie + suppression
      if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
        await fs.copyFile(tempPath, target);
        await fs.unlink(tempPath);
      } else {
        throw err;
      }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.getLocalPath(key)!);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Suppression impossible pour "${key}": ${err}`);
      }
    }
  }

  getPublicUrl(key: string): string {
    const base = process.env.MEDIA_BASE_URL?.trim().replace(/\/+$/, '');
    return `${base || getPublicBaseUrl()}/media/${key}`;
  }

  getLocalPath(key: string): string {
    return join(this.root, key);
  }
}
