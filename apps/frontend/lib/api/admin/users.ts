import { api } from "@/lib/api/client"

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  status: UserStatus
  createdAt: string
  updatedAt: string
  role: { id: string; name: string }
}

export interface AdminUsersResponse {
  items: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateUserPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  roleId: string
  phone?: string
  status?: UserStatus
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  // email et password : acceptés par l'API uniquement pour le Super Admin
  email?: string
  password?: string
  phone?: string
  roleId?: string
  status?: UserStatus
}

export const adminUsersApi = {
  list: (params?: { page?: number; limit?: number; roleId?: string; status?: string }) =>
    api.get<AdminUsersResponse>("/users", { params: { limit: 100, ...params } }),

  findOne: (id: string) =>
    api.get<AdminUser>(`/users/${id}`),

  create: (payload: CreateUserPayload) =>
    api.post<AdminUser>("/users", payload),

  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<AdminUser>(`/users/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/users/${id}`),
}
