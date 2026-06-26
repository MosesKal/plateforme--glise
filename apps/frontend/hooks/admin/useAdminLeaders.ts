"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminLeadersApi,
  type Leader,
  type LeaderPayload,
} from "@/lib/api/admin/leaders"

const KEY = ["admin", "leaders"] as const

export function useAdminLeaders() {
  return useQuery<Leader[]>({
    queryKey: KEY,
    queryFn: () => adminLeadersApi.list(),
  })
}

export function useCreateLeader() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LeaderPayload) => adminLeadersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateLeader() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LeaderPayload }) =>
      adminLeadersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteLeader() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminLeadersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export type { Leader, LeaderPayload }
