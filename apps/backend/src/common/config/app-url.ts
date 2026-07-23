/**
 * Configuration des URLs publiques du backend.
 *
 * Le backend expose son API sous le préfixe `api/v1` (voir main.ts) et sert les
 * fichiers uploadés sous `api/v1/uploads/`. Pour que le frontend puisse afficher
 * ces fichiers, on renvoie des URLs ABSOLUES — dont l'origine diffère selon
 * l'environnement.
 */

/** Préfixe global de l'API (doit rester synchronisé avec setGlobalPrefix dans main.ts). */
export const API_PREFIX = 'api/v1';

/** Domaine public du backend en production. */
const PROD_BASE_URL = 'https://api.campdejesusbelairfizi.com';

/**
 * Origine publique du backend, utilisée pour construire les liens absolus vers
 * les fichiers uploadés.
 *
 * Différenciation prod / local :
 *  1. `BACKEND_URL` défini      → utilisé tel quel (override explicite).
 *  2. `NODE_ENV=production`      → domaine public de production.
 *  3. sinon (local / dev)        → http://localhost:<PORT>.
 */
export function getPublicBaseUrl(): string {
  const override = process.env.BACKEND_URL?.trim();
  if (override) return override.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') return PROD_BASE_URL;

  const port = process.env.PORT ?? '3001';
  return `http://localhost:${port}`;
}

/** Construit l'URL absolue d'un fichier uploadé (servi sous /api/v1/uploads/). */
export function buildUploadUrl(filename: string): string {
  return `${getPublicBaseUrl()}/${API_PREFIX}/uploads/${filename}`;
}

/**
 * Origine publique du SITE (frontend), pour les liens sortants générés par le
 * backend (flux RSS podcast…). Même logique de résolution que getPublicBaseUrl :
 * en production le site et l'API partagent le domaine ; en local ils diffèrent
 * (3000 / 3001), d'où le fallback distinct.
 */
export function getSiteBaseUrl(): string {
  const override = process.env.SITE_URL?.trim();
  if (override) return override.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') return PROD_BASE_URL;

  return 'http://localhost:3000';
}
