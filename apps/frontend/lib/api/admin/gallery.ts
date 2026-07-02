import { api } from "@/lib/api/client"

export type MediaType = "IMAGE" | "VIDEO"

export interface GalleryAlbum {
  id: string
  title: string
  description?: string | null
  coverUrl?: string | null
  createdAt: string
  updatedAt: string
  _count: { items: number }
}

export interface GalleryItem {
  id: string
  title?: string | null
  mediaUrl: string
  mediaType: MediaType
  albumId?: string | null
  order: number
  createdAt: string
  album?: { id: string; title: string } | null
}

export interface GalleryItemsResponse {
  items: GalleryItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateGalleryItemPayload {
  mediaUrl: string
  title?: string
  mediaType?: MediaType
  albumId?: string
  order?: number
}

export interface UpdateGalleryItemPayload {
  title?: string
  mediaUrl?: string
  mediaType?: MediaType
  albumId?: string | null
  order?: number
}

export interface AlbumPayload {
  title: string
  description?: string
  coverUrl?: string
}

export const adminGalleryApi = {
  listItems: (params?: { albumId?: string; mediaType?: string; page?: number; limit?: number }) =>
    api.get<GalleryItemsResponse>("/gallery", { params }).then((r) => r.data),

  createItem: (payload: CreateGalleryItemPayload) =>
    api.post<GalleryItem>("/gallery", payload).then((r) => r.data),

  createItems: (items: CreateGalleryItemPayload[]) =>
    api.post<GalleryItem[]>("/gallery/bulk", { items }).then((r) => r.data),

  updateItem: (id: string, payload: UpdateGalleryItemPayload) =>
    api.patch<GalleryItem>(`/gallery/${id}`, payload).then((r) => r.data),

  deleteItem: (id: string) =>
    api.delete(`/gallery/${id}`).then((r) => r.data),

  listAlbums: () =>
    api.get<GalleryAlbum[]>("/gallery/albums").then((r) => r.data),

  createAlbum: (payload: AlbumPayload) =>
    api.post<GalleryAlbum>("/gallery/albums", payload).then((r) => r.data),

  updateAlbum: (id: string, payload: AlbumPayload) =>
    api.patch<GalleryAlbum>(`/gallery/albums/${id}`, payload).then((r) => r.data),

  deleteAlbum: (id: string) =>
    api.delete(`/gallery/albums/${id}`).then((r) => r.data),
}
