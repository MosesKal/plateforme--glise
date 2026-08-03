"use client"

import type { Testimony } from "@/lib/api/admin/testimonies"
import { cn } from "@/lib/utils"

const PREVIEW_CHARACTER_LIMIT = 360

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
  const isExpandable = item.content.length > PREVIEW_CHARACTER_LIMIT
  const contentId = `testimony-content-${item.id}`

  return (
    <article
      id={`testimony-${item.id}`}
      className="scroll-mt-28 rounded-[1.75rem] border border-cecj-rule bg-cecj-panel p-6 shadow-[0_16px_50px_rgba(2,67,57,0.06)] sm:p-8"
    >
      <header className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cecj-green text-sm font-bold text-white">
            {initials(item.fullName)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-cecj-green sm:text-lg">{item.fullName}</h3>
            <p className="mt-1 text-xs capitalize text-cecj-ink-dim">
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <span
          className="shrink-0 font-serif text-6xl leading-none text-cecj-gold/35"
          aria-hidden="true"
        >
          &ldquo;
        </span>
      </header>

      <div className="my-6 h-px bg-cecj-rule" />

      <blockquote
        id={contentId}
        className={cn(
          "whitespace-pre-wrap break-words text-base font-medium leading-8 text-cecj-ink transition-all sm:text-lg sm:leading-9",
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
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-cecj-green/20 px-5 text-sm font-bold text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
        >
          {isExpanded ? "Réduire" : "Lire la suite"}
          <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
        </button>
      )}
    </article>
  )
}
