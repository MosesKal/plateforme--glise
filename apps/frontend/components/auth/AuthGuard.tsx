"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { getRefreshToken } from "@/lib/token-store"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated && !getRefreshToken()) {
      router.replace("/fr/login")
    }
  }, [mounted, isAuthenticated, router])

  // Same render on server and first client pass — avoids hydration mismatch
  if (!mounted) return null

  // After mount: waiting for AuthInitializer to restore the session from localStorage
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
