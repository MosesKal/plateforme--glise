"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminScheduleApi, type ScheduleEntryPayload } from "@/lib/api/admin/schedule"

const QK = ["admin", "schedule"] as const

export function useAdminSchedule() {
  return useQuery({
    queryKey: QK,
    queryFn: () => adminScheduleApi.list().then((r) => r.data),
    staleTime: 30_000,
  })
}

export function useCreateScheduleEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ScheduleEntryPayload) =>
      adminScheduleApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdateScheduleEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ScheduleEntryPayload> }) =>
      adminScheduleApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeleteScheduleEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminScheduleApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
