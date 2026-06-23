"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminExtensionsApi, type ExtensionPayload } from "@/lib/api/admin/extensions"

const QK = ["admin", "extensions"] as const

export function useAdminExtensions() {
  return useQuery({
    queryKey: QK,
    queryFn: () => adminExtensionsApi.list().then((r) => r.data.items),
    staleTime: 30_000,
  })
}

export function useCreateExtension() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExtensionPayload) => adminExtensionsApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdateExtension() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ExtensionPayload> }) =>
      adminExtensionsApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeleteExtension() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminExtensionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
