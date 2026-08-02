import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { dirname, isAbsolute, relative, resolve } from 'path';
import { getPublicBaseUrl } from '../common/config/app-url';
import { StorageProvider } from './storage-provider.interface';
import { getMediaRoot, getUploadTmpDir } from './storage.config';

/**
 * Stockage sur le disque local du VPS.
 *
 * Les fichiers vivent dans MEDIA_ROOT (hors de l'arborescence applicative en
 * production) et sont servis sous /media/ — par Caddy en production (sendfile,
 * Range natif), par le fallback statique de main.ts en développement.
 */
@Injectable()
export class LocalStorageProvider
  implements StorageProvider, OnApplicationBootstrap
{
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly root = getMediaRoot();

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([
      fs.mkdir(this.root, { recursive: true }),
      fs.mkdir(getUploadTmpDir(), { recursive: true }),
    ]);
    const probe = resolve(this.root, `.write-probe-${randomUUID()}`);
    try {
      await fs.writeFile(probe, 'ok', { flag: 'wx' });
    } finally {
      await fs.unlink(probe).catch(() => undefined);
    }
  }

  async save(tempPath: string, key: string): Promise<void> {
    const target = this.getLocalPath(key);
    await fs.mkdir(dirname(target), { recursive: true });
    try {
      await fs.rename(tempPath, target);
    } catch (err: unknown) {
      // rename échoue entre volumes différents (EXDEV) → copie + suppression
      if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
        await this.copyAtomically(tempPath, target);
      } else {
        throw err;
      }
    }
  }

  async move(sourceKey: string, targetKey: string): Promise<void> {
    const source = this.getLocalPath(sourceKey);
    const target = this.getLocalPath(targetKey);
    if (source === target) return;

    await fs.mkdir(dirname(target), { recursive: true });
    try {
      await fs.rename(source, target);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
        await this.copyAtomically(source, target);
      } else {
        throw err;
      }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.getLocalPath(key));
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(
          `Suppression impossible pour "${key}": ${String(err)}`,
        );
        throw err;
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.getLocalPath(key));
      return true;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw err;
    }
  }

  getPublicUrl(key: string): string {
    const base = process.env.MEDIA_BASE_URL?.trim().replace(/\/+$/, '');
    return `${base || getPublicBaseUrl()}/media/${key}`;
  }

  getLocalPath(key: string): string {
    const target = resolve(this.root, key);
    const fromRoot = relative(this.root, target);
    if (!fromRoot || (!fromRoot.startsWith('..') && !isAbsolute(fromRoot))) {
      return target;
    }
    throw new Error(`Clé de stockage hors MEDIA_ROOT : ${key}`);
  }

  private async copyAtomically(source: string, target: string): Promise<void> {
    const partial = `${target}.partial-${randomUUID()}`;
    try {
      await fs.copyFile(source, partial);
      await fs.rename(partial, target);
      await fs.unlink(source);
    } catch (err) {
      await fs.unlink(partial).catch(() => undefined);
      throw err;
    }
  }
}
