"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminDepartmentsApi,
  type Department,
  type DepartmentPayload,
} from "@/lib/api/admin/departments"

const KEY = ["admin", "departments"] as const

export function useAdminDepartments() {
  return useQuery<Department[]>({
    queryKey: KEY,
    queryFn: () => adminDepartmentsApi.list(),
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DepartmentPayload) => adminDepartmentsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DepartmentPayload }) =>
      adminDepartmentsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminDepartmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export type { Department }
