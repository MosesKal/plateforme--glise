"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminTestimoniesApi,
  type Testimony,
  type TestimoniesResponse,
  type TestimonyStatus,
} from "@/lib/api/admin/testimonies"

const KEY = ["admin", "testimonies"] as const

export function useAdminTestimonies(status?: string) {
  return useQuery<TestimoniesResponse>({
    queryKey: [...KEY, status],
    queryFn: () => adminTestimoniesApi.list({ status }),
  })
}

export function useUpdateTestimonyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TestimonyStatus }) =>
      adminTestimoniesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteTestimony() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminTestimoniesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export type { Testimony, TestimonyStatus }
