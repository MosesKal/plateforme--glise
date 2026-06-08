"use client"

import { useAuthStore } from "@/store/auth.store"
import { authApi } from "@/lib/api/auth"
import type { LoginInput, RegisterInput } from "@/lib/validations/auth"

export function useAuth() {
  const { user, setAuth, clearAuth } = useAuthStore()

  async function login(data: LoginInput) {
    const response = await authApi.login(data)
    setAuth(response.user, response.accessToken)
    return response
  }

  async function register(data: RegisterInput) {
    const response = await authApi.register(data)
    setAuth(response.user, response.accessToken)
    return response
  }

  async function logout() {
    await authApi.logout()
    clearAuth()
  }

  return {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
