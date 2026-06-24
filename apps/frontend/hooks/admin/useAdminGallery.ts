"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminGalleryApi,
  type AlbumPayload,
  type CreateGalleryItemPayload,
  type GalleryAlbum,
  type GalleryItemsResponse,
  type UpdateGalleryItemPayload,
} from "@/lib/api/admin/gallery"

const ITEMS_KEY = ["admin", "gallery", "items"] as const
const ALBUMS_KEY = ["admin", "gallery", "albums"] as const

export function useAdminGalleryItems(params?: { albumId?: string; mediaType?: string }) {
  return useQuery<GalleryItemsResponse>({
    queryKey: [...ITEMS_KEY, params],
    queryFn: () => adminGalleryApi.listItems({ ...params, limit: 100 }),
  })
}

export function useAdminAlbums() {
  return useQuery<GalleryAlbum[]>({
    queryKey: ALBUMS_KEY,
    queryFn: adminGalleryApi.listAlbums,
  })
}

export function useCreateGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGalleryItemPayload) => adminGalleryApi.createItem(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  })
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGalleryItemPayload }) =>
      adminGalleryApi.updateItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  })
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminGalleryApi.deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  })
}

export function useCreateAlbum() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AlbumPayload) => adminGalleryApi.createAlbum(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ALBUMS_KEY }),
  })
}

export function useUpdateAlbum() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AlbumPayload }) =>
      adminGalleryApi.updateAlbum(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ALBUMS_KEY }),
  })
}

export function useDeleteAlbum() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminGalleryApi.deleteAlbum(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALBUMS_KEY })
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}
