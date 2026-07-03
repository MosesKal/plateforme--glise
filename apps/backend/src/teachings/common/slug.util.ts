const NFD_DIACRITICS = /[̀-ͯ]/g;

/** Convertit un texte en slug URL-safe ("La Foi & l'Épreuve" → "la-foi-l-epreuve"). */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(NFD_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Garantit l'unicité d'un slug en suffixant -2, -3… si nécessaire.
 * `exists` interroge la source de vérité (DB) pour un candidat donné.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || 'sans-titre';
  let candidate = root;
  for (let i = 2; await exists(candidate); i++) {
    candidate = `${root}-${i}`;
  }
  return candidate;
}
