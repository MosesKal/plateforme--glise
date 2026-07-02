"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminContactApi, type ContactMessage } from "@/lib/api/admin/contact"

const KEY = ["admin", "contact"] as const

export function useAdminContact() {
  return useQuery<ContactMessage[]>({
    queryKey: KEY,
    queryFn: () => adminContactApi.list(),
  })
}

export function useMarkContactRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminContactApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminContactApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export type { ContactMessage }
