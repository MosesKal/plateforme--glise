"use client"

import Image from "next/image"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const EDGE_FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"

const PROGRAM_PHOTOS = Array.from({ length: 20 }, (_, i) => `/img_prg_${i + 1}.jpg`)

function PhotoCard({ src }: { src: string }) {
  return (
    <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-2xl shadow-sm sm:h-52 sm:w-72">
      <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 639px) 192px, 288px" />
    </div>
  )
}

function MarqueeRow({ photos, reverse }: { photos: string[]; reverse?: boolean }) {
  const reduceMotion = useReducedMotion()
  const track = reduceMotion ? photos : [...photos, ...photos]
  const durationSeconds = photos.length * 8

  return (
    <div
      className="overflow-hidden"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <div
        className={cn("marquee-track flex w-max gap-3 sm:gap-4", !reduceMotion && "animate-marquee")}
        style={
          reduceMotion
            ? undefined
            : { animationDuration: `${durationSeconds}s`, animationDirection: reverse ? "reverse" : "normal" }
        }
      >
        {track.map((src, i) => (
          <PhotoCard key={i} src={src} />
        ))}
      </div>
    </div>
  )
}

export function ProgramPhotosMarquee() {
  const mid = Math.ceil(PROGRAM_PHOTOS.length / 2)
  const row1 = PROGRAM_PHOTOS.slice(0, mid)
  const row2 = PROGRAM_PHOTOS.slice(mid)

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <MarqueeRow photos={row1} />
      <MarqueeRow photos={row2} reverse />
    </div>
  )
}
