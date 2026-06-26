"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminPagesApi, type PagePayload, type SitePage } from "@/lib/api/admin/pages"

const PAGES_KEY = ["admin", "pages"] as const

export function useAdminPages() {
  return useQuery<SitePage[]>({
    queryKey: PAGES_KEY,
    queryFn: adminPagesApi.list,
  })
}

export function useCreatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PagePayload) => adminPagesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGES_KEY }),
  })
}

export function useUpdatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PagePayload> }) =>
      adminPagesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGES_KEY }),
  })
}

export function useDeletePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminPagesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGES_KEY }),
  })
}
