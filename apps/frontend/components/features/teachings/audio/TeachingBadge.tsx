"use client"

import { useI18n } from "@/components/providers/I18nProvider"
import type { AudioTeaching } from "@/lib/api/teachings"

/** Fenêtre pendant laquelle un enseignement fraîchement publié est « Nouveau ». */
const NEW_WINDOW_DAYS = 14
/** Seuil d'écoutes du badge « Populaire » — à ajuster avec l'audience réelle. */
const POPULAR_MIN_PLAYS = 20

const DAY_MS = 24 * 60 * 60 * 1000

type TeachingBadgeKind = "popular" | "new" | null

/**
 * Un seul badge par enseignement pour garder les listes lisibles.
 * « Populaire » prime sur « Nouveau » : c'est le signal le plus rare et la
 * meilleure preuve sociale.
 */
export function getTeachingBadge(teaching: AudioTeaching): TeachingBadgeKind {
  if (teaching.playCount >= POPULAR_MIN_PLAYS) return "popular"
  const ageMs = Date.now() - new Date(teaching.createdAt).getTime()
  if (ageMs >= 0 && ageMs < NEW_WINDOW_DAYS * DAY_MS) return "new"
  return null
}

export function TeachingBadge({ teaching }: { teaching: AudioTeaching }) {
  const { t } = useI18n()
  const kind = getTeachingBadge(teaching)
  if (!kind) return null

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        kind === "popular"
          ? "bg-cecj-green/10 text-cecj-green"
          : "bg-cecj-gold/25 text-cecj-green"
      }`}
    >
      {kind === "popular"
        ? t("teachings.common.badgePopular")
        : t("teachings.common.badgeNew")}
    </span>
  )
}
