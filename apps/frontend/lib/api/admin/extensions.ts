import { api } from "@/lib/api/client"

export type ExtensionStatus = "ACTIVE" | "INACTIVE" | "COMING_SOON"

export interface AdminExtension {
  id: string
  name: string
  country: string
  city: string
  address: string | null
  phone: string | null
  email: string | null
  pastorName: string | null
  pastorPhone: string | null
  latitude: number | null
  longitude: number | null
  status: ExtensionStatus
  coverImage: string | null
  description: string | null
  foundedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminExtensionsResponse {
  items: AdminExtension[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ExtensionPayload {
  name: string
  country: string
  city: string
  address?: string
  phone?: string
  email?: string
  pastorName?: string
  pastorPhone?: string
  latitude?: number
  longitude?: number
  status?: ExtensionStatus
  coverImage?: string
  description?: string
  foundedAt?: string
}

export const adminExtensionsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<AdminExtensionsResponse>("/extensions", {
      params: { limit: 100, status: "all", ...params },
    }),

  create: (payload: ExtensionPayload) =>
    api.post<AdminExtension>("/extensions", payload),

  update: (id: string, payload: Partial<ExtensionPayload>) =>
    api.patch<AdminExtension>(`/extensions/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/extensions/${id}`),
}
