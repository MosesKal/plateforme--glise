/**
 * Valeurs Open Graph partagées.
 *
 * Piège Next : un `openGraph` défini au niveau d'une page REMPLACE entièrement
 * celui du layout (aucune fusion des objets imbriqués) — siteName et image par
 * défaut disparaissent silencieusement. Toute page qui déclare son propre
 * `openGraph` doit donc étaler `OG_DEFAULTS` :
 *
 *   openGraph: { ...OG_DEFAULTS, title, description }
 */

/** Route qui génère l'image Open Graph par défaut (app/og/route.tsx). */
export const OG_IMAGE_PATH = "/og"

export const OG_DEFAULTS = {
  siteName: "C.E.C.J.C.",
  type: "website" as const,
  images: [OG_IMAGE_PATH],
}
