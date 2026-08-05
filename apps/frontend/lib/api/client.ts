import axios from "axios"
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/token-store"
import { getLoginUrl } from "@/lib/auth/getLoginUrl"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  timeout: 10_000,
})

let refreshPromise: Promise<string> | null = null

function redirectToLogin() {
  setAccessToken(null)
  setRefreshToken(null)
  if (typeof window !== "undefined") {
    window.location.href = getLoginUrl(window.location.pathname)
  }
}

function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return Promise.reject(new Error("Refresh token missing"))
  }

  refreshPromise = api
    .post<{
      accessToken: string
      refreshToken: string
    }>("/auth/refresh", { refreshToken })
    .then(({ data }) => {
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      return data.accessToken
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

// ─── Request: inject Authorization header ─────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Le navigateur doit générer lui-même le Content-Type multipart avec sa
  // boundary. Un header JSON (ou multipart sans boundary) empêche Multer de
  // lire le champ `file` et le backend répond alors « Aucun fichier reçu ».
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type")
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
      try {
        // Un seul refresh est envoyé même si plusieurs requêtes expirent au
        // même instant. Le backend fait tourner le refresh token et rejetterait
        // les appels concurrents suivants avec 401.
        const accessToken = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        // Refresh expiré, invalide ou absent : la session n'est plus utilisable.
        redirectToLogin()
      }
    }

    return Promise.reject(error)
  },
)
