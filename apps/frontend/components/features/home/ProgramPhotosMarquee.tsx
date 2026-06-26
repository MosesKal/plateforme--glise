"use client"

import Image from "next/image"
import { useReducedMotion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { adminGalleryApi } from "@/lib/api/admin/gallery"
import { cn } from "@/lib/utils"

const EDGE_FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"

function PhotoCard({ src }: { src: string }) {
  return (
    <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-2xl shadow-sm sm:h-52 sm:w-72">
      <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 639px) 192px, 288px" />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="h-32 w-48 shrink-0 animate-pulse rounded-2xl bg-cecj-green/10 sm:h-52 sm:w-72" />
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

function SkeletonRow() {
  return (
    <div className="flex gap-3 overflow-hidden sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function ProgramPhotosMarquee() {
  const { data, isLoading } = useQuery({
    queryKey: ["public", "gallery", "program-photos"],
    queryFn: () => adminGalleryApi.listItems({ mediaType: "IMAGE", limit: 20 }),
  })

  const photos = (data?.items ?? []).map((item) => item.mediaUrl)

  if (isLoading || photos.length === 0) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  }

  const mid = Math.ceil(photos.length / 2)
  const row1 = photos.slice(0, mid)
  const row2 = photos.slice(mid)

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <MarqueeRow photos={row1} />
      <MarqueeRow photos={row2} reverse />
    </div>
  )
}
