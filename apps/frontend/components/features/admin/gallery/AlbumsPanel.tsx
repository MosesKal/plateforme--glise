"use client"

import type { GalleryAlbum } from "@/lib/api/admin/gallery"

interface Props {
  albums: GalleryAlbum[]
  selectedAlbumId: string | null
  onSelect: (albumId: string | null) => void
  onEdit: (album: GalleryAlbum) => void
  onDelete: (id: string) => void
}

export function AlbumsPanel({ albums, selectedAlbumId, onSelect, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          selectedAlbumId === null
            ? "bg-cecj-green text-white"
            : "border border-gray-200 bg-white text-gray-600 hover:border-cecj-green hover:text-cecj-green"
        }`}
      >
        Tous les médias
      </button>

      {albums.map((album) => (
        <div key={album.id} className="group relative flex items-center gap-1">
          <button
            onClick={() => onSelect(album.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedAlbumId === album.id
                ? "bg-cecj-green text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-cecj-green hover:text-cecj-green"
            }`}
          >
            {album.title}
            <span className={`ml-1.5 text-xs ${selectedAlbumId === album.id ? "text-white/70" : "text-gray-400"}`}>
              ({album._count.items})
            </span>
          </button>

          <div className="hidden gap-1 group-hover:flex">
            <button
              onClick={() => onEdit(album)}
              title="Modifier"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(album.id)}
              title="Supprimer"
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
