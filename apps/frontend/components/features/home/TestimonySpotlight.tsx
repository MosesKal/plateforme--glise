"use client"

import { useCallback, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import type { Testimony } from "@/lib/api/admin/testimonies"
import { cn } from "@/lib/utils"

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

interface TestimonySpotlightProps {
  items: Testimony[]
}

export function TestimonySpotlight({ items }: TestimonySpotlightProps) {
  const shouldReduceMotion = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const goTo = useCallback(
    (next: number, direction: number) => {
      setDir(direction)
      setExpandedId(null)
      setIdx((next + items.length) % items.length)
    },
    [items.length],
  )

  const safeIdx = Math.min(idx, Math.max(items.length - 1, 0))
  const item = items[safeIdx]

  if (!item) return null

  const isExpanded = expandedId === item.id
  const isExpandable = item.content.length > 280 || item.content.split(/\r?\n/).length > 5

  return (
    <div
      className="mx-auto w-[calc(100%-2rem)] max-w-5xl"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Témoignages publiés"
    >
      <div className="overflow-hidden rounded-[2rem] border border-cecj-rule bg-cecj-panel shadow-[0_24px_80px_rgba(2,67,57,0.08)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={item.id}
            layout
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -24 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid lg:grid-cols-[minmax(16rem,0.36fr)_minmax(0,0.64fr)]"
            aria-live="polite"
          >
            <div className="relative flex flex-col justify-between overflow-hidden bg-cecj-green p-7 text-white sm:p-9">
              <div
                className="pointer-events-none absolute -right-3 -top-6 font-serif text-[10rem] leading-none text-cecj-gold/15"
                aria-hidden="true"
              >
                &ldquo;
              </div>

              <div className="relative flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                  <span className="h-2 w-2 rounded-full bg-cecj-gold" />
                  Témoignage publié
                </span>
                <span className="text-xs font-semibold tabular-nums text-white/50">
                  {String(safeIdx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-12 flex items-center gap-4 lg:mt-24">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold text-cecj-gold">
                  {initials(item.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{item.fullName}</p>
                  <p className="mt-1 text-xs capitalize text-white/55">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-[22rem] flex-col p-7 sm:p-9 lg:p-10">
              <div className="mb-5 h-1 w-12 rounded-full bg-cecj-gold" aria-hidden="true" />
              <blockquote
                id={`spotlight-content-${item.id}`}
                className={cn(
                  "flex-1 whitespace-pre-line text-lg font-medium leading-8 text-cecj-ink sm:text-xl sm:leading-9",
                  isExpandable && !isExpanded && "line-clamp-6",
                )}
              >
                {item.content}
              </blockquote>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-cecj-rule pt-6">
                {isExpandable ? (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`spotlight-content-${item.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cecj-green px-5 text-sm font-bold text-white transition-colors hover:bg-cecj-gold hover:text-cecj-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
                  >
                    {isExpanded ? "Réduire" : "Lire la suite"}
                    <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-cecj-ink-dim">
                    Témoignage complet
                  </span>
                )}

                {items.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goTo(safeIdx - 1, -1)}
                      aria-label="Afficher le témoignage précédent"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-cecj-rule text-lg text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
                    >
                      <span aria-hidden="true">←</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(safeIdx + 1, 1)}
                      aria-label="Afficher le témoignage suivant"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-cecj-green bg-cecj-green text-lg text-white transition-colors hover:border-cecj-gold hover:bg-cecj-gold hover:text-cecj-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
                    >
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  )
}
