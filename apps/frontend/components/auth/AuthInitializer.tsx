"use client"

import { useEffect, useRef } from "react"
import { authApi } from "@/lib/api/auth"
import { getRefreshToken } from "@/lib/token-store"
import { useAuthStore } from "@/store/auth.store"

export function AuthInitializer() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const token = getRefreshToken()
    if (!token) return

    authApi.refresh(token).then(({ data }) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
    }).catch(() => {
      // Expired or invalid refresh token — stay logged out, no action needed
    })
  }, [setAuth])

  return null
}
