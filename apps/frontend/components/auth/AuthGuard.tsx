"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { getRefreshToken } from "@/lib/token-store"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    // After mount: if no access token in memory AND no refresh token in localStorage → login
    if (!isAuthenticated && !getRefreshToken()) {
      router.replace("/fr/login")
    }
  }, [isAuthenticated, router])

  // While AuthInitializer is restoring the session, show a loading state
  if (!isAuthenticated && getRefreshToken()) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cecj-green border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
