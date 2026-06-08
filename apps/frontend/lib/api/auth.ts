import { apiClient } from "./client"
import type { AuthResponse } from "@/types/api"
import type { LoginInput, RegisterInput } from "@/lib/validations/auth"

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", data)
    return res.data
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/register", data)
    return res.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout")
  },

  refresh: async (): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/refresh")
    return res.data
  },
}
