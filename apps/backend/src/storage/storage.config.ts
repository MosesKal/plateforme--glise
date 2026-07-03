import { join } from 'path';

/**
 * Racine du stockage médias.
 *
 * En production, définir MEDIA_ROOT hors de l'arborescence applicative
 * (ex. /var/lib/cecj/media) pour que les fichiers survivent aux redéploiements
 * et soient servis directement par Nginx (location /media/).
 */
export function getMediaRoot(): string {
  return process.env.MEDIA_ROOT?.trim() || join(process.cwd(), 'media');
}

/** Répertoire temporaire des uploads en cours (même volume que MEDIA_ROOT → rename atomique). */
export function getUploadTmpDir(): string {
  return join(getMediaRoot(), 'tmp');
}
