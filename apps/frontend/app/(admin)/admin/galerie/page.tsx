"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { GalleryGrid } from "@/components/features/admin/gallery/GalleryGrid"
import { GalleryItemFormModal, type GalleryItemPayload } from "@/components/features/admin/gallery/GalleryItemFormModal"
import { AlbumFormModal } from "@/components/features/admin/gallery/AlbumFormModal"
import { AlbumsPanel } from "@/components/features/admin/gallery/AlbumsPanel"
import {
  useAdminGalleryItems,
  useAdminAlbums,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  useCreateAlbum,
  useUpdateAlbum,
  useDeleteAlbum,
} from "@/hooks/admin/useAdminGallery"
import type { GalleryAlbum, GalleryItem } from "@/lib/api/admin/gallery"

export default function AdminGaleriePage() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("")

  const { data: itemsData, isLoading: itemsLoading, isError: itemsError } =
    useAdminGalleryItems({ albumId: selectedAlbumId ?? undefined, mediaType: mediaTypeFilter || undefined })
  const { data: albums = [] } = useAdminAlbums()

  const items = itemsData?.items ?? []

  const createItem  = useCreateGalleryItem()
  const updateItem  = useUpdateGalleryItem()
  const deleteItem  = useDeleteGalleryItem()
  const createAlbum = useCreateAlbum()
  const updateAlbum = useUpdateAlbum()
  const deleteAlbum = useDeleteAlbum()

  const [itemModalOpen, setItemModalOpen]   = useState(false)
  const [editItem, setEditItem]             = useState<GalleryItem | null>(null)
  const [albumModalOpen, setAlbumModalOpen] = useState(false)
  const [editAlbum, setEditAlbum]           = useState<GalleryAlbum | null>(null)

  const openAddItem  = () => { setEditItem(null); setItemModalOpen(true) }
  const openEditItem = (item: GalleryItem) => { setEditItem(item); setItemModalOpen(true) }
  const closeItem    = () => { setItemModalOpen(false); setEditItem(null) }

  const openAddAlbum  = () => { setEditAlbum(null); setAlbumModalOpen(true) }
  const openEditAlbum = (album: GalleryAlbum) => { setEditAlbum(album); setAlbumModalOpen(true) }
  const closeAlbum    = () => { setAlbumModalOpen(false); setEditAlbum(null) }

  const handleItemSubmit = async (values: GalleryItemPayload) => {
    const payload = {
      mediaUrl:  values.mediaUrl,
      title:     values.title || undefined,
      mediaType: values.mediaType,
      albumId:   values.albumId || undefined,
      order:     values.order ?? 0,
    }
    if (editItem) {
      await updateItem.mutateAsync({ id: editItem.id, payload })
    } else {
      await createItem.mutateAsync(payload)
    }
    closeItem()
  }

  const handleAlbumSubmit = async (values: { title: string; description?: string; coverUrl?: string }) => {
    const payload = {
      title:       values.title,
      description: values.description || undefined,
      coverUrl:    values.coverUrl || undefined,
    }
    if (editAlbum) {
      await updateAlbum.mutateAsync({ id: editAlbum.id, payload })
    } else {
      await createAlbum.mutateAsync(payload)
    }
    closeAlbum()
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem.mutateAsync(id)
  }

  const handleDeleteAlbum = async (id: string) => {
    const album = albums.find((a) => a.id === id)
    if (album && album._count.items > 0) {
      alert(`Impossible de supprimer l'album "${album.title}" car il contient ${album._count.items} média(s). Déplacez ou supprimez les médias d'abord.`)
      return
    }
    await deleteAlbum.mutateAsync(id)
    if (selectedAlbumId === id) setSelectedAlbumId(null)
  }

  const images = items.filter((i) => i.mediaType === "IMAGE").length
  const videos = items.filter((i) => i.mediaType === "VIDEO").length

  return (
    <>
      <GalleryItemFormModal
        open={itemModalOpen}
        onClose={closeItem}
        onSubmit={handleItemSubmit}
        initialData={editItem}
        albums={albums}
      />
      <AlbumFormModal
        open={albumModalOpen}
        onClose={closeAlbum}
        onSubmit={handleAlbumSubmit}
        initialData={editAlbum}
      />

      <div className="space-y-6">
        <PageHeader
          title="Galerie"
          subtitle="Gestion des photos et vidéos"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={openAddAlbum}>
                + Album
              </Button>
              <Button onClick={openAddItem} className="bg-cecj-green hover:bg-cecj-green/90">
                + Ajouter un média
              </Button>
            </div>
          }
        />

        <div className="flex gap-4">
          {[
            { label: "Total",   value: itemsData?.total ?? 0, color: "text-gray-900"  },
            { label: "Photos",  value: images,                color: "text-cecj-green" },
            { label: "Vidéos",  value: videos,                color: "text-cecj-gold"  },
            { label: "Albums",  value: albums.length,         color: "text-gray-500"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
          <AlbumsPanel
            albums={albums}
            selectedAlbumId={selectedAlbumId}
            onSelect={setSelectedAlbumId}
            onEdit={openEditAlbum}
            onDelete={handleDeleteAlbum}
          />
          <select
            value={mediaTypeFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-cecj-green"
          >
            <option value="">Tous les types</option>
            <option value="IMAGE">Photos</option>
            <option value="VIDEO">Vidéos</option>
          </select>
        </div>

        {itemsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : itemsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : (
          <GalleryGrid items={items} onEdit={openEditItem} onDelete={handleDeleteItem} />
        )}
      </div>
    </>
  )
}
