"use client"

import type { Testimony } from "@/lib/api/admin/testimonies"
import { cn } from "@/lib/utils"

const PREVIEW_CHARACTER_LIMIT = 280
const PREVIEW_LINE_LIMIT = 5

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

interface ExpandableTestimonyCardProps {
  item: Testimony
  isExpanded: boolean
  onToggle: () => void
}

export function ExpandableTestimonyCard({
  item,
  isExpanded,
  onToggle,
}: ExpandableTestimonyCardProps) {
  const isExpandable =
    item.content.length > PREVIEW_CHARACTER_LIMIT ||
    item.content.split(/\r?\n/).length > PREVIEW_LINE_LIMIT
  const contentId = `testimony-content-${item.id}`

  return (
    <article
      id={`testimony-${item.id}`}
      className="scroll-mt-28 min-w-0 max-w-full overflow-hidden rounded-3xl border border-cecj-rule bg-cecj-panel p-5 shadow-[0_16px_50px_rgba(2,67,57,0.06)] sm:rounded-[1.75rem] sm:p-8"
    >
      <header className="flex min-w-0 items-start justify-between gap-3 sm:gap-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cecj-green text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-sm">
            {initials(item.fullName)}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 [overflow-wrap:anywhere] text-sm font-bold leading-5 text-cecj-green sm:text-lg sm:leading-7">{item.fullName}</h3>
            <p className="mt-1 text-xs capitalize text-cecj-ink-dim">
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <span
          className="shrink-0 font-serif text-5xl leading-none text-cecj-gold/35 sm:text-6xl"
          aria-hidden="true"
        >
          &ldquo;
        </span>
      </header>

      <div className="my-5 h-px bg-cecj-rule sm:my-6" />

      <blockquote
        id={contentId}
        className={cn(
          "min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] text-[0.9375rem] font-medium leading-7 text-cecj-ink transition-all sm:text-lg sm:leading-9",
          isExpandable && !isExpanded && "line-clamp-7",
        )}
      >
        {item.content}
      </blockquote>

      {isExpandable && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-cecj-green/20 px-5 text-sm font-bold text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green sm:w-auto"
        >
          {isExpanded ? "Réduire" : "Lire la suite"}
          <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
        </button>
      )}
    </article>
  )
}
