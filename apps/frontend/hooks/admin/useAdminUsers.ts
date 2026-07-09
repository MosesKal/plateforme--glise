"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminUsersApi, type CreateUserPayload, type UpdateUserPayload } from "@/lib/api/admin/users"

const QK = ["admin", "users"] as const

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: QK,
    queryFn: () => adminUsersApi.list().then((r) => r.data.items),
    staleTime: 30_000,
    enabled,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      adminUsersApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      adminUsersApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
