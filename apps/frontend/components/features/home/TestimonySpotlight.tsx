"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import type { Testimony } from "@/lib/api/admin/testimonies"
import { TestimonyReaderDialog } from "@/components/features/temoignages/TestimonyReaderDialog"

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

interface TestimonySpotlightProps {
  items: Testimony[]
}

function useIsTextTruncated(content: string) {
  const textRef = useRef<HTMLQuoteElement>(null)
  const [measurement, setMeasurement] = useState({
    content: "",
    isTruncated: false,
  })

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    const measure = () => {
      const isTruncated = element.scrollHeight > element.clientHeight + 1
      setMeasurement((current) =>
        current.content === content && current.isTruncated === isTruncated
          ? current
          : { content, isTruncated },
      )
    }

    const frame = window.requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [content])

  return {
    textRef,
    isTruncated:
      measurement.content === content && measurement.isTruncated,
  }
}

export function TestimonySpotlight({ items }: TestimonySpotlightProps) {
  const shouldReduceMotion = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [readerItem, setReaderItem] = useState<Testimony | null>(null)

  const goTo = useCallback(
    (next: number, direction: number) => {
      setDir(direction)
      setIdx((next + items.length) % items.length)
    },
    [items.length],
  )

  useEffect(() => {
    if (items.length <= 1 || shouldReduceMotion || isPaused || readerItem) return

    const id = window.setInterval(() => {
      setDir(1)
      setIdx((current) => (current + 1) % items.length)
    }, 7000)

    return () => window.clearInterval(id)
  }, [isPaused, items.length, readerItem, shouldReduceMotion])

  const safeIdx = Math.min(idx, Math.max(items.length - 1, 0))
  const item = items[safeIdx]
  const { textRef, isTruncated } = useIsTextTruncated(item?.content ?? "")

  if (!item) return null

  return (
    <>
      <div
        className="relative mx-auto flex min-h-[25rem] w-[calc(100%-2rem)] max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-cecj-rule bg-cecj-panel p-6 shadow-[0_24px_80px_rgba(2,67,57,0.08)] sm:p-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
      <div className="pointer-events-none absolute right-8 top-6 font-serif text-[9rem] leading-none text-cecj-gold/15" aria-hidden="true">
        &ldquo;
      </div>

      <div className="relative flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cecj-green/60">
          <span className="h-2 w-2 rounded-full bg-cecj-gold" />
          Témoignage publié
        </span>
        <span className="text-xs font-semibold tabular-nums text-cecj-ink-dim">
          {String(safeIdx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
      </div>

      <div className="relative mt-8 flex flex-1 items-center overflow-hidden sm:mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIdx}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 32 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -32, transition: { duration: 0.25 } }}
            className="w-full"
          >
            <blockquote
              ref={textRef}
              className="line-clamp-6 text-xl font-medium leading-relaxed text-cecj-ink sm:text-2xl sm:leading-relaxed"
            >
              {item.content}
            </blockquote>
            {isTruncated && (
              <button
                type="button"
                onClick={() => setReaderItem(item)}
                aria-haspopup="dialog"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-cecj-green/20 px-5 text-sm font-bold text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
              >
                Lire le témoignage complet
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-cecj-rule pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cecj-green text-sm font-bold text-white">
            {initials(item.fullName)}
          </div>
          <div>
            <p className="font-bold text-cecj-green">{item.fullName}</p>
            <p className="text-xs capitalize text-cecj-ink-dim">
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {items.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(safeIdx - 1, -1)}
              aria-label="Afficher le témoignage précédent"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cecj-rule text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(safeIdx + 1, 1)}
              aria-label="Afficher le témoignage suivant"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-cecj-green text-white transition-colors hover:bg-cecj-gold hover:text-cecj-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
      </div>

      {readerItem && (
        <TestimonyReaderDialog
          key={readerItem.id}
          testimony={readerItem}
          onClose={() => setReaderItem(null)}
        />
      )}
    </>
  )
}
