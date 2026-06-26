"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Testimony } from "@/lib/api/admin/testimonies"

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

interface TestimonySpotlightProps {
  items: Testimony[]
}

export function TestimonySpotlight({ items }: TestimonySpotlightProps) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  const goTo = useCallback((next: number) => {
    setDir(next > idx ? 1 : -1)
    setIdx(next)
  }, [idx])

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => {
      setDir(1)
      setIdx((i) => (i + 1) % items.length)
    }, 6000)
    return () => clearInterval(id)
  }, [items.length])

  const item = items[idx]
  if (!item) return null

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8">
      {/* Quote block */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: dir * 48 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, x: dir * -48, transition: { duration: 0.3 } }}
            className="flex flex-col items-center text-center"
          >
            {/* Decorative quote mark */}
            <div
              className="mb-5 font-serif select-none leading-none"
              style={{ fontSize: "6rem", color: "rgba(255,203,50,0.45)", lineHeight: 1 }}
              aria-hidden
            >
              &ldquo;
            </div>

            {/* Testimony text */}
            <p className="mb-8 text-xl font-medium italic leading-relaxed text-cecj-ink sm:text-2xl lg:text-[1.75rem]">
              {item.content}
            </p>

            {/* Separator */}
            <div className="mb-6 h-px w-14" style={{ background: "rgba(255,203,50,0.6)" }} />

            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "#024339" }}
              >
                {initials(item.fullName)}
              </div>
              <div className="text-left">
                <p className="font-bold text-cecj-green">{item.fullName}</p>
                <p className="text-sm text-cecj-ink-dim">
                  {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot navigation */}
      {items.length > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Témoignage ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? "2rem" : "0.5rem",
                background: i === idx ? "#024339" : "rgba(2,67,57,0.2)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
