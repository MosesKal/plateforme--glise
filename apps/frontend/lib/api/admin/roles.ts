import { api } from "@/lib/api/client"

export interface AdminRole {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: { users: number }
}

export interface RolePayload {
  name: string
  description?: string
}

export const adminRolesApi = {
  list: () =>
    api.get<AdminRole[]>("/roles"),

  create: (payload: RolePayload) =>
    api.post<AdminRole>("/roles", payload),

  update: (id: string, payload: Partial<RolePayload>) =>
    api.patch<AdminRole>(`/roles/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/roles/${id}`),
}
