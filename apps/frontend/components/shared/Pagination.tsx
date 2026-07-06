"use client"

/**
 * Fenêtre de pages avec ellipses : toujours la première, la dernière et les
 * voisines de la page courante — ex. 1 … 4 [5] 6 … 12.
 */
function pageWindow(page: number, totalPages: number): (number | "ellipsis")[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1])
  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const out: (number | "ellipsis")[] = []
  for (const [i, p] of pages.entries()) {
    if (i > 0 && p - pages[i - 1] > 1) out.push("ellipsis")
    out.push(p)
  }
  return out
}

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Total d'éléments — affiché en libellé si fourni. */
  total?: number
  /** Libellé singulier de l'élément compté (ex. « enseignement »). */
  itemLabel?: string
}

/**
 * Pagination numérotée pour les listes du backoffice. Ne rend rien si tout
 * tient sur une page.
 */
export function Pagination({ page, totalPages, onPageChange, total, itemLabel }: PaginationProps) {
  if (totalPages <= 1) return null

  const go = (p: number) => onPageChange(Math.min(Math.max(p, 1), totalPages))

  const navButton =
    "flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {total != null && itemLabel && (
        <p className="text-xs text-gray-400">
          {total} {itemLabel}
          {total > 1 ? "s" : ""} · page {page} / {totalPages}
        </p>
      )}

      <nav aria-label="Pagination" className="ml-auto flex items-center gap-1.5">
        <button onClick={() => go(page - 1)} disabled={page <= 1} className={navButton}>
          Précédent
        </button>

        {pageWindow(page, totalPages).map((item, i) =>
          item === "ellipsis" ? (
            <span key={`e-${i}`} className="px-1 text-sm text-gray-300">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => go(item)}
              aria-current={item === page ? "page" : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                item === page
                  ? "bg-cecj-green text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-cecj-green hover:text-cecj-green"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button onClick={() => go(page + 1)} disabled={page >= totalPages} className={navButton}>
          Suivant
        </button>
      </nav>
    </div>
  )
}
