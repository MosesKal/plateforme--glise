import axios from "axios"
import { CONFIG } from "@/constants/config"

// Token en mémoire — jamais dans localStorage pour éviter les attaques XSS
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export const apiClient = axios.create({
  baseURL: CONFIG.apiUrl,
  withCredentials: true, // envoie les cookies httpOnly (refresh token)
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isUnauthorized = error.response?.status === 401
    const isRefreshRoute = error.config?.url?.includes("/auth/refresh")

    if (isUnauthorized && !isRefreshRoute && typeof window !== "undefined") {
      // Tentative de refresh avant de rediriger
      try {
        const { data } = await apiClient.post("/auth/refresh")
        setAccessToken(data.accessToken)
        error.config.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(error.config)
      } catch {
        setAccessToken(null)
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)
