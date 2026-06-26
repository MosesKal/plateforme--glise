import { api } from "@/lib/api/client"

export type LeaderRole =
  | "FOUNDER"
  | "SENIOR_PASTOR"
  | "PASTOR"
  | "ELDER"
  | "DEACON"
  | "WORSHIP_LEADER"
  | "YOUTH_LEADER"
  | "OTHER"

export interface Leader {
  id: string
  firstName: string
  lastName: string
  title?: string | null
  role: LeaderRole
  bio?: string | null
  photoUrl?: string | null
  email?: string | null
  phone?: string | null
  order: number
  isActive: boolean
  createdAt: string
}

export interface LeaderPayload {
  firstName: string
  lastName: string
  title?: string
  role?: LeaderRole
  bio?: string
  photoUrl?: string
  email?: string
  phone?: string
  order?: number
  isActive?: boolean
}

export const adminLeadersApi = {
  list: () =>
    api.get<Leader[]>("/leaders").then((r) => r.data),

  create: (payload: LeaderPayload) =>
    api.post<Leader>("/leaders", payload).then((r) => r.data),

  update: (id: string, payload: LeaderPayload) =>
    api.patch<Leader>(`/leaders/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/leaders/${id}`).then((r) => r.data),
}
