import { dirname, join } from 'path';

/**
 * Racine du stockage médias.
 *
 * En production, définir MEDIA_ROOT hors de l'arborescence applicative
 * (ex. /var/lib/cecj/media) pour que les fichiers survivent aux redéploiements
 * et soient servis directement par Caddy (voir deploy/Caddyfile.example).
 */
export function getMediaRoot(): string {
  const configured = process.env.MEDIA_ROOT?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MEDIA_ROOT est obligatoire en production');
  }
  return join(process.cwd(), 'media');
}

/** Répertoire temporaire des uploads en cours (même volume que MEDIA_ROOT → rename atomique). */
export function getUploadTmpDir(): string {
  const configured = process.env.MEDIA_TEMP_ROOT?.trim();
  if (configured) return configured;

  // Le temporaire reste sur le même volume que MEDIA_ROOT pour préserver les
  // renommages atomiques, mais hors de /media afin de ne jamais être public.
  return join(dirname(getMediaRoot()), '.cecj-media-tmp');
}
