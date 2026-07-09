"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminEventsApi, type EventPayload } from "@/lib/api/admin/events"

const QK = ["admin", "events"] as const

export function useAdminEvents(enabled = true) {
  return useQuery({
    queryKey: QK,
    queryFn: () => adminEventsApi.list().then((r) => r.data.items),
    staleTime: 30_000,
    enabled,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EventPayload) => adminEventsApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EventPayload> }) =>
      adminEventsApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminEventsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
