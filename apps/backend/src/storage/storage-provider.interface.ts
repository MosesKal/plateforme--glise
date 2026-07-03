/**
 * Abstraction du stockage des fichiers médias.
 *
 * Règle d'or : la base de données ne stocke JAMAIS d'URL, uniquement des clés
 * (ex. "audio/2026/clxy123.mp3"). L'URL publique est résolue à la lecture par
 * le provider actif. Migrer vers un stockage objet (R2/S3) = fournir une autre
 * implémentation de cette interface, sans toucher au schéma ni aux services.
 */
export interface StorageProvider {
  /** Déplace un fichier temporaire vers le stockage définitif sous la clé donnée. */
  save(tempPath: string, key: string): Promise<void>;

  /** Supprime le fichier associé à la clé (silencieux si absent). */
  delete(key: string): Promise<void>;

  /** Résout l'URL publique d'une clé de stockage. */
  getPublicUrl(key: string): string;

  /** Chemin absolu local d'une clé (utilisé par ffprobe/ffmpeg). */
  getLocalPath(key: string): string | null;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
