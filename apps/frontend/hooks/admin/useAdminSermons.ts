"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminSermonsApi,
  type AdminSermon,
  type CreateSermonPayload,
  type SermonCategory,
  type SermonsResponse,
  type UpdateSermonPayload,
} from "@/lib/api/admin/sermons"

const SERMONS_KEY    = ["admin", "sermons"] as const
const CATEGORIES_KEY = ["admin", "sermons", "categories"] as const

export function useAdminSermons(params?: { categoryId?: string; status?: string; search?: string }) {
  return useQuery<SermonsResponse>({
    queryKey: [...SERMONS_KEY, params],
    queryFn: () => adminSermonsApi.list(params),
  })
}

export function useAdminSermonCategories() {
  return useQuery<SermonCategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: adminSermonsApi.listCategories,
  })
}

export function useCreateSermon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSermonPayload) => adminSermonsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERMONS_KEY }),
  })
}

export function useUpdateSermon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSermonPayload }) =>
      adminSermonsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERMONS_KEY }),
  })
}

export function useDeleteSermon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminSermonsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERMONS_KEY }),
  })
}

export function useCreateSermonCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => adminSermonsApi.createCategory(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}

export function useUpdateSermonCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      adminSermonsApi.updateCategory(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}

export function useDeleteSermonCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminSermonsApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      qc.invalidateQueries({ queryKey: SERMONS_KEY })
    },
  })
}

// Re-export types for convenience
export type { AdminSermon, SermonCategory }
