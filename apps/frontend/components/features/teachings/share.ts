import type { AudioTeaching } from "@/lib/api/teachings"

/**
 * Lien absolu vers la page d'un enseignement audio, avec position de départ
 * optionnelle (`?t=` en secondes, convention YouTube). La page de détail lit
 * ce paramètre à l'arrivée et lance le player à cette position.
 */
export function audioTeachingShareUrl(
  locale: string,
  teaching: Pick<AudioTeaching, "slug"> & { theme: { slug: string } },
  startAtSec?: number,
): string {
  const base = `${window.location.origin}/${locale}/enseignements/audio/${teaching.theme.slug}/${teaching.slug}`
  return startAtSec && startAtSec > 0 ? `${base}?t=${Math.floor(startAtSec)}` : base
}

/** Ouvre WhatsApp (app en mobile, WhatsApp Web en desktop) avec un message pré-rempli. */
export function openWhatsAppShare(message: string): void {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  )
}
