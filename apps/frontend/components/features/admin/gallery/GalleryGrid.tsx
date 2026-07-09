"use client"

import Image from "next/image"
import type { GalleryItem } from "@/lib/api/admin/gallery"

interface Props {
  items: GalleryItem[]
  onEdit: (item: GalleryItem) => void
  onDelete: (id: string) => void
}

export function GalleryGrid({ items, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-400">Aucun média. Ajoutez votre première photo ou vidéo.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          {item.mediaType === "IMAGE" ? (
            <Image
              src={item.mediaUrl}
              alt={item.title ?? "Média"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800">
              <svg className="h-10 w-10 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Actions au survol (desktop) ; toujours visibles sur écrans tactiles où le hover n'existe pas */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100 pointer-coarse:bg-black/40 pointer-coarse:opacity-100">
            <button
              onClick={() => onEdit(item)}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-white"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>

          {item.mediaType === "VIDEO" && (
            <span className="absolute left-2 top-2 rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Vidéo
            </span>
          )}
          {item.album && (
            <span className="absolute bottom-2 left-2 right-2 truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {item.album.title}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
