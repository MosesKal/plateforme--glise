"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminRolesApi, type RolePayload } from "@/lib/api/admin/roles"

const QK = ["admin", "roles"] as const

export function useAdminRoles() {
  return useQuery({
    queryKey: QK,
    queryFn: () => adminRolesApi.list().then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RolePayload) =>
      adminRolesApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<RolePayload> }) =>
      adminRolesApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminRolesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
