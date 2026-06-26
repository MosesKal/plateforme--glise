"use client"

import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Testimony } from "@/lib/api/admin/testimonies"

const EDGE_FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export function TestimonyCard({
  item,
  className,
  truncate = true,
}: {
  item: Testimony
  className?: string
  truncate?: boolean
}) {
  return (
    <div className={cn("flex shrink-0 flex-col rounded-2xl border border-cecj-rule bg-cecj-tint p-6 shadow-sm", className ?? "w-[300px] sm:w-[340px]")}>
      <div
        className="mb-3 font-serif text-5xl leading-none select-none"
        style={{ color: "rgba(255,203,50,0.35)", lineHeight: 1 }}
        aria-hidden
      >
        &ldquo;
      </div>
      <p className={cn("flex-1 text-sm leading-relaxed text-cecj-ink italic", truncate && "line-clamp-4")}>
        {item.content}
      </p>
      <div className="my-5 h-px w-10" style={{ background: "rgba(255,203,50,0.4)" }} />
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "#024339" }}
        >
          {initials(item.fullName)}
        </div>
        <div>
          <p className="text-sm font-semibold text-cecj-green">{item.fullName}</p>
          <p className="text-xs text-cecj-ink-dim">
            {new Date(item.createdAt).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, reverse }: { items: Testimony[]; reverse?: boolean }) {
  const reduceMotion = useReducedMotion()
  const track = reduceMotion ? items : [...items, ...items]
  const durationSeconds = items.length * 7

  return (
    <div
      className="overflow-hidden"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <div
        className={cn("marquee-track flex w-max gap-6", !reduceMotion && "animate-marquee")}
        style={
          reduceMotion
            ? undefined
            : {
                animationDuration: `${durationSeconds}s`,
                animationDirection: reverse ? "reverse" : "normal",
              }
        }
      >
        {track.map((item, i) => (
          <TestimonyCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

interface TestimonialsMarqueeProps {
  items: Testimony[]
}

export function TestimonialsMarquee({ items }: TestimonialsMarqueeProps) {
  const mid = Math.ceil(items.length / 2)
  const row1 = items.slice(0, mid)
  const row2 = items.slice(mid)

  return (
    <div className="flex flex-col gap-6">
      <MarqueeRow items={row1} />
      {row2.length > 0 && <MarqueeRow items={row2} reverse />}
    </div>
  )
}
