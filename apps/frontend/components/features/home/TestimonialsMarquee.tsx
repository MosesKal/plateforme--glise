"use client"

import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface Testimonial {
  texte: string
  nom: string
  role: string
  initiales: string
}

interface TestimonialsMarqueeProps {
  items: Testimonial[]
}

const EDGE_FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-cecj-rule bg-cecj-tint p-6 shadow-sm sm:w-[340px]">
      <div
        className="mb-3 font-serif text-5xl leading-none select-none"
        style={{ color: "rgba(255,203,50,0.35)", lineHeight: 1 }}
        aria-hidden
      >
        &ldquo;
      </div>
      <p className="flex-1 text-sm leading-relaxed text-cecj-ink italic">{item.texte}</p>
      <div className="my-5 h-px w-10" style={{ background: "rgba(255,203,50,0.4)" }} />
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "#024339" }}
        >
          {item.initiales}
        </div>
        <div>
          <p className="text-sm font-semibold text-cecj-green">{item.nom}</p>
          <p className="text-xs text-cecj-ink-dim">{item.role}</p>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
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
            : { animationDuration: `${durationSeconds}s`, animationDirection: reverse ? "reverse" : "normal" }
        }
      >
        {track.map((item, i) => (
          <TestimonialCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
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
