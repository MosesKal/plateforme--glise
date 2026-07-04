"use client"

import Image from "next/image"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const EDGE_FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"

// Sélection curatée — ambiance des cultes C.E.C.J.C. (indépendant de la galerie DB)
const CULTE_PHOTOS = [
  // Louange & adoration
  "/img_prg_1.jpg",
  "/img_prg_2.jpg",
  "/img_prg_8.jpg",
  "/img_prg_12.jpg",
  "/gallerie/650731373_122201476070573866_644263338686884455_n.jpg",
  "/gallerie/671642257_122205384440573866_5936308301799538439_n.jpg",
  "/gallerie/670352671_122205809636573866_1366897198823659959_n.jpg",
  // Musique & instruments
  "/img_prg_4.jpg",
  "/gallerie/670515348_122205384620573866_452393700888848750_n.jpg",
  "/gallerie/668566958_122205384536573866_8105236588643463794_n.jpg",
  "/gallerie/669572390_122205384710573866_1166659460247898057_n.jpg",
  // Prédication
  "/img_prg_5.jpg",
  "/img_prg_7.jpg",
  "/img_prg_14.jpg",
  // Assemblée
  "/img_prg_3.jpg",
  "/img_prg_10.jpg",
  "/img_prg_17.jpg",
  "/img_prg_6.jpg",
  "/img_prg_9.jpg",
  "/img_prg_15.jpg",
]

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
  const mid = Math.ceil(CULTE_PHOTOS.length / 2)
  const row1 = CULTE_PHOTOS.slice(0, mid)
  const row2 = CULTE_PHOTOS.slice(mid)

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <MarqueeRow photos={row1} />
      <MarqueeRow photos={row2} reverse />
    </div>
  )
}
