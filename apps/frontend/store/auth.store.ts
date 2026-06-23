"use client"

import { create } from "zustand"
import { setAccessToken, setRefreshToken } from "@/lib/token-store"
import type { AuthUser } from "@/lib/api/auth"

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth(user, accessToken, refreshToken) {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    set({ user, isAuthenticated: true })
  },

  clearAuth() {
    setAccessToken(null)
    setRefreshToken(null)
    set({ user: null, isAuthenticated: false })
  },
}))
