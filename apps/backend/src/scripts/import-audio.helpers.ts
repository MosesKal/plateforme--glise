/**
 * Fonctions pures du script d'import de masse (testables sans contexte Nest).
 */

export interface ImportCliOptions {
  dir: string;
  speaker: string;
  status: 'DRAFT' | 'PUBLISHED';
  dryRun: boolean;
}

export const IMPORT_USAGE = `Usage :
  pnpm --filter @cecj/backend import:audio -- --dir <chemin> --speaker "Nom Complet" [options]

Options :
  --dir <chemin>       Racine de la bibliothèque (sous-dossiers = thèmes)   [requis]
  --speaker <nom>      Orateur assigné à tous les enseignements importés    [requis]
  --status <statut>    DRAFT | PUBLISHED (défaut : PUBLISHED)
  --dry-run            Affiche le plan d'import sans rien écrire`;

/** Parse les arguments CLI — lève une erreur avec l'usage si invalides. */
export function parseImportArgs(argv: string[]): ImportCliOptions {
  const options: Partial<ImportCliOptions> = {
    status: 'PUBLISHED',
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--dir':
        options.dir = argv[++i];
        break;
      case '--speaker':
        options.speaker = argv[++i];
        break;
      case '--status': {
        const status = argv[++i];
        if (status !== 'DRAFT' && status !== 'PUBLISHED') {
          throw new Error(
            `--status doit être DRAFT ou PUBLISHED (reçu : "${status}")\n\n${IMPORT_USAGE}`,
          );
        }
        options.status = status;
        break;
      }
      case '--dry-run':
        options.dryRun = true;
        break;
      default:
        throw new Error(`Argument inconnu : "${arg}"\n\n${IMPORT_USAGE}`);
    }
  }

  if (!options.dir?.trim() || !options.speaker?.trim()) {
    throw new Error(`--dir et --speaker sont requis\n\n${IMPORT_USAGE}`);
  }

  return options as ImportCliOptions;
}

/**
 * Déduit un titre lisible d'un nom de fichier : extension retirée,
 * numérotation de piste en tête ignorée ("01 - ", "3.", "12)"),
 * underscores convertis en espaces.
 *
 * "07 - La_puissance de la priere.mp3" → "La puissance de la priere"
 */
export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[a-z0-9]+$/i, '');
  const title = base
    .replace(/^\d{1,3}\s*[-._)]+\s*/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Nom entièrement numérique ("01.mp3") : le nettoyage viderait le titre.
  return title || base.trim();
}

const MIME_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  mpeg: 'audio/mpeg',
  mpga: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
};

/** Type MIME déduit de l'extension (défaut du schéma Prisma sinon). */
export function mimeTypeForExtension(ext: string): string {
  return (
    MIME_BY_EXTENSION[ext.replace(/^\./, '').toLowerCase()] ?? 'audio/mpeg'
  );
}
