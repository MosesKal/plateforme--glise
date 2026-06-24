import { api } from "@/lib/api/client"

export interface Department {
  id: string
  name: string
  description?: string | null
  leaderName?: string | null
  photoUrl?: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DepartmentPayload {
  name: string
  description?: string
  leaderName?: string
  photoUrl?: string
  order?: number
  isActive?: boolean
}

export const adminDepartmentsApi = {
  list: (activeOnly?: boolean) =>
    api.get<Department[]>("/departments", { params: activeOnly ? { active: "true" } : undefined }).then((r) => r.data),

  create: (payload: DepartmentPayload) =>
    api.post<Department>("/departments", payload).then((r) => r.data),

  update: (id: string, payload: DepartmentPayload) =>
    api.patch<Department>(`/departments/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/departments/${id}`).then((r) => r.data),
}
