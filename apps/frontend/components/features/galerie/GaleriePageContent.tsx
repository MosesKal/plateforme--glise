"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
}

const staggerSlow: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

// Données statiques — à remplacer par un appel React Query vers l'API
const galerieImages = [
  { src: "/image_1.jpg",  alt: "Vie de la communauté" },
  { src: "/image_2.jpg",  alt: "Vie de la communauté" },
  { src: "/image_3.jpg",  alt: "Vie de la communauté" },
  { src: "/image_4.jpg",  alt: "Vie de la communauté" },
  { src: "/image_5.jpg",  alt: "Vie de la communauté" },
  { src: "/image_6.jpg",  alt: "Vie de la communauté" },
  { src: "/image_7.jpg",  alt: "Vie de la communauté" },
  { src: "/image_8.jpg",  alt: "Vie de la communauté" },
  { src: "/image_9.jpg",  alt: "Vie de la communauté" },
  { src: "/image_10.jpg", alt: "Vie de la communauté" },
]

function GalerieImageCard({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      variants={scaleUp}
      className="group relative aspect-square overflow-hidden rounded-xl"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-cecj-green/10" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-all duration-500 group-hover:scale-110",
          loaded ? "opacity-100" : "opacity-0",
        )}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-cecj-green/0 transition-colors duration-300 group-hover:bg-cecj-green/30" />
    </motion.div>
  )
}

export function GaleriePageContent() {
  // isLoading simule le délai d'un appel API — à remplacer par useQuery
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-cecj-green sm:text-4xl">Galerie</h1>
        <div className="mb-3 h-1 w-16 rounded bg-cecj-gold/60" />
        <p className="text-gray-500">Photos et moments marquants de la communauté C.E.C.J.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5"
          variants={staggerSlow}
          initial="hidden"
          animate="visible"
        >
          {galerieImages.map((img) => (
            <GalerieImageCard key={img.src} src={img.src} alt={img.alt} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
