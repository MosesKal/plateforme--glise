import axios from "axios"
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/token-store"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
})

// ─── Request: inject Authorization header ─────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response: unwrap envelope + auto-refresh on 401 ─────────────────────────

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "data" in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const original = error.config

    // Attempt a silent token refresh on 401 (but not for auth endpoints)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true
      const refreshToken = getRefreshToken()

      if (refreshToken) {
        try {
          const { data } = await api.post<{
            accessToken: string
            refreshToken: string
          }>("/auth/refresh", { refreshToken })

          setAccessToken(data.accessToken)
          setRefreshToken(data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch {
          // Refresh failed — clear session and redirect to login
          setAccessToken(null)
          setRefreshToken(null)
          if (typeof window !== "undefined") {
            window.location.href = `/${window.location.pathname.split("/")[1]}/login`
          }
        }
      }
    }

    return Promise.reject(error)
  },
)
