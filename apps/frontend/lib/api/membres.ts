import { apiClient } from "./client"
import type { Membre } from "@/types/models"
import type { PaginatedResponse } from "@/types/api"
import type { MembreInput } from "@/lib/validations/membre"

export const membresApi = {
  findAll: async (page = 1, limit = 20): Promise<PaginatedResponse<Membre>> => {
    const res = await apiClient.get<PaginatedResponse<Membre>>("/membres", {
      params: { page, limit },
    })
    return res.data
  },

  findOne: async (id: string): Promise<Membre> => {
    const res = await apiClient.get<Membre>(`/membres/${id}`)
    return res.data
  },

  create: async (data: MembreInput): Promise<Membre> => {
    const res = await apiClient.post<Membre>("/membres", data)
    return res.data
  },

  update: async (id: string, data: Partial<MembreInput>): Promise<Membre> => {
    const res = await apiClient.patch<Membre>(`/membres/${id}`, data)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/membres/${id}`)
  },
}
