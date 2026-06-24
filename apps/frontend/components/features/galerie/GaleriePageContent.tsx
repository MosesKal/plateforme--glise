"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"
import type { GalleryAlbum } from "@/lib/api/admin/gallery"
import { adminGalleryApi } from "@/lib/api/admin/gallery"

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
}

const staggerSlow: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

function GalerieImageCard({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      variants={scaleUp}
      className="group relative aspect-square overflow-hidden rounded-xl"
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-cecj-green/10" />}
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
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)

  const { data: albums = [] } = useQuery<GalleryAlbum[]>({
    queryKey: ["public", "gallery", "albums"],
    queryFn: adminGalleryApi.listAlbums,
  })

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["public", "gallery", "items", selectedAlbumId],
    queryFn: () => adminGalleryApi.listItems({
      albumId: selectedAlbumId ?? undefined,
      mediaType: "IMAGE",
      limit: 50,
    }),
  })

  const items = itemsData?.items ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-cecj-green sm:text-4xl">Galerie</h1>
        <div className="mb-3 h-1 w-16 rounded bg-cecj-gold/60" />
        <p className="text-gray-500">Photos et moments marquants de la communauté C.E.C.J.</p>
      </div>

      {albums.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedAlbumId(null)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedAlbumId === null
                ? "bg-cecj-green text-white"
                : "border border-gray-200 text-gray-600 hover:border-cecj-green hover:text-cecj-green",
            )}
          >
            Tout voir
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                selectedAlbumId === album.id
                  ? "bg-cecj-green text-white"
                  : "border border-gray-200 text-gray-600 hover:border-cecj-green hover:text-cecj-green",
              )}
            >
              {album.title}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400">Aucune photo disponible pour le moment.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5"
          variants={staggerSlow}
          initial="hidden"
          animate="visible"
        >
          {items.map((item) => (
            <GalerieImageCard key={item.id} src={item.mediaUrl} alt={item.title ?? "Photo C.E.C.J."} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
