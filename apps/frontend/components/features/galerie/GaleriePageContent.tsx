"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/Skeleton"
import { GalleryLightbox } from "@/components/features/home/GalleryLightbox"
import { cn } from "@/lib/utils"
import type { GalleryAlbum } from "@/lib/api/admin/gallery"
import { adminGalleryApi } from "@/lib/api/admin/gallery"

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

/** Sélection courante : un album réel, ou "toutes les photos" (id = null). */
type Selection = { id: string | null; title: string; description?: string | null }

/** Couverture de l'album : coverUrl explicite, sinon 1ère image, sinon null. */
function albumCover(album: GalleryAlbum): string | null {
  return album.coverUrl || album.items?.[0]?.mediaUrl || null
}

/* ─────────────────────────────  Carte album  ───────────────────────────── */

function AlbumCard({
  cover,
  title,
  count,
  variant = "album",
  onClick,
}: {
  cover: string | null
  title: string
  count?: number
  variant?: "album" | "all"
  onClick: () => void
}) {
  return (
    <motion.button
      variants={scaleUp}
      onClick={onClick}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-xl"
    >
      {cover ? (
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            variant === "all" ? "from-cecj-gold/80 to-cecj-green" : "from-cecj-green to-cecj-green/60",
          )}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Badge coin — pastille "album" */}
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
        </svg>
        {typeof count === "number" ? count : ""}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-bold leading-tight text-white drop-shadow-sm">{title}</h3>
        <p className="mt-0.5 text-xs text-white/80">
          {variant === "all"
            ? "Parcourir toutes les photos"
            : `${count} photo${(count ?? 0) > 1 ? "s" : ""}`}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cecj-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Ouvrir
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────  Carte photo (vue détail)  ───────────────────────────── */

function PhotoCard({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.button
      variants={scaleUp}
      onClick={onClick}
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
      <div className="absolute inset-0 flex items-center justify-center bg-cecj-green/0 transition-colors duration-300 group-hover:bg-cecj-green/30">
        <svg
          className="h-7 w-7 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
        </svg>
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────  Page  ───────────────────────────── */

export function GaleriePageContent() {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const { data: albums = [], isLoading: albumsLoading } = useQuery<GalleryAlbum[]>({
    queryKey: ["public", "gallery", "albums"],
    queryFn: adminGalleryApi.listAlbums,
  })

  const albumsWithItems = albums.filter((a) => a._count.items > 0)
  const hasAlbums = albumsWithItems.length > 0
  // Sans aucun album : on retombe sur une grille plate de toutes les photos.
  const flatMode = !albumsLoading && !hasAlbums

  const activeAlbumId = selection?.id ?? null
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["public", "gallery", "items", activeAlbumId],
    queryFn: () =>
      adminGalleryApi.listItems({
        albumId: activeAlbumId ?? undefined,
        mediaType: "IMAGE",
        limit: 100,
      }),
    enabled: flatMode || selection !== null,
  })

  const items = itemsData?.items ?? []
  const images = items.map((i) => i.mediaUrl)

  const showPhotos = flatMode || selection !== null

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-cecj-green sm:text-4xl">Galerie</h1>
        <div className="mb-3 h-1 w-16 rounded bg-cecj-gold/60" />
        <p className="text-gray-500">
          Photos et moments marquants de l&apos;église Cité le Camps de Jésus-Christ Bel-Air Fizi
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ───── Vue photos (détail album, ou grille plate) ───── */}
        {showPhotos ? (
          <motion.div
            key={`photos-${activeAlbumId ?? "flat"}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {/* Barre retour (uniquement quand on a navigué dans un album) */}
            {!flatMode && selection && (
              <div className="mb-6">
                <button
                  onClick={() => setSelection(null)}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cecj-green transition-colors hover:text-cecj-green/70"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Retour aux albums
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{selection.title}</h2>
                {selection.description && (
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{selection.description}</p>
                )}
              </div>
            )}

            {itemsLoading ? (
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
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {items.map((item, i) => (
                  <PhotoCard
                    key={item.id}
                    src={item.mediaUrl}
                    alt={item.title ?? "Photo C.E.C.J.C."}
                    onClick={() => setLightboxIndex(i)}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ───── Vue albums ───── */
          <motion.div
            key="albums"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {albumsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {/* Carte "toutes les photos" */}
                <AlbumCard
                  cover={albumsWithItems.map(albumCover).find(Boolean) ?? null}
                  title="Toutes les photos"
                  variant="all"
                  onClick={() => setSelection({ id: null, title: "Toutes les photos" })}
                />

                {albumsWithItems.map((album) => (
                  <AlbumCard
                    key={album.id}
                    cover={albumCover(album)}
                    title={album.title}
                    count={album._count.items}
                    onClick={() =>
                      setSelection({ id: album.id, title: album.title, description: album.description })
                    }
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox plein écran (navigation + miniatures + zoom) */}
      <GalleryLightbox
        images={images}
        open={lightboxIndex >= 0}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </div>
  )
}
