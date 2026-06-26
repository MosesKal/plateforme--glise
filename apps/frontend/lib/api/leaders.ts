import { api } from "@/lib/api/client"

export interface Leader {
  id: string
  firstName: string
  lastName: string
  title?: string | null
  role?: string | null
  bio?: string | null
  photoUrl?: string | null
  email?: string | null
  phone?: string | null
  order: number
  isActive: boolean
  createdAt: string
}

export const leadersApi = {
  list: () => api.get<Leader[]>("/leaders").then((r) => r.data),
}
