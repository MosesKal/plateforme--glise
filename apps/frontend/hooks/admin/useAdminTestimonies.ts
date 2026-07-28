"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminTestimoniesApi,
  type AdminTestimony,
  type TestimoniesResponse,
  type TestimonyStatus,
} from "@/lib/api/admin/testimonies"
import { toast } from "@/store/toast.store"

const KEY = ["admin", "testimonies"] as const

export function useAdminTestimonies(status?: string, enabled = true) {
  return useQuery<TestimoniesResponse>({
    queryKey: [...KEY, status],
    queryFn: () => adminTestimoniesApi.list({ status }),
    enabled,
  })
}

export function useUpdateTestimonyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TestimonyStatus }) =>
      adminTestimoniesApi.updateStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: KEY }),
        qc.invalidateQueries({ queryKey: ["public", "testimonies"] }),
      ])
    },
  })
}

export function useUpdateTestimonyContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      editedContent,
    }: {
      id: string
      editedContent: string | null
    }) => adminTestimoniesApi.updateContent(id, editedContent),
    onSuccess: async (testimony) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: KEY }),
        qc.invalidateQueries({ queryKey: ["public", "testimonies"] }),
      ])
      toast.success(
        testimony.editedContent == null
          ? "La version originale a été restaurée."
          : "La correction du témoignage a été enregistrée.",
      )
    },
  })
}

export function useDeleteTestimony() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminTestimoniesApi.remove(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: KEY }),
        qc.invalidateQueries({ queryKey: ["public", "testimonies"] }),
      ])
    },
  })
}

export type { AdminTestimony, TestimonyStatus }
