"use client"

import { useI18n } from "@/components/providers/I18nProvider"

interface LoadMoreButtonProps {
  /** Nombre d'éléments encore non chargés. */
  remaining: number
  loading: boolean
  onClick: () => void
}

/**
 * Bouton « Charger plus » des listes publiques (chargement progressif).
 * Ne rend rien quand tout est chargé — le parent peut l'inclure sans condition.
 */
export function LoadMoreButton({ remaining, loading, onClick }: LoadMoreButtonProps) {
  const { t } = useI18n()

  if (remaining <= 0) return null

  return (
    <div className="pt-8 text-center">
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-cecj-green px-6 py-2.5 text-sm font-semibold text-cecj-green transition hover:bg-cecj-green hover:text-white disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t("teachings.common.loading")}
          </>
        ) : (
          <>
            {t("teachings.common.loadMore")} ({remaining}{" "}
            {remaining > 1
              ? t("teachings.common.remainingPlural")
              : t("teachings.common.remainingSingular")}
            )
          </>
        )}
      </button>
    </div>
  )
}
