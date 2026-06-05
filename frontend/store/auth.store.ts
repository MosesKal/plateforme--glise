import { create } from "zustand"
import { setAccessToken } from "@/lib/api/client"
import type { User } from "@/types/models"

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, token) => {
    setAccessToken(token) // synchronise le token dans l'intercepteur axios
    set({ user, accessToken: token })
  },

  clearAuth: () => {
    setAccessToken(null)
    set({ user: null, accessToken: null })
  },
}))
