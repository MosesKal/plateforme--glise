"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useUiStore } from "@/store/ui.store"
import { authApi } from "@/lib/api/auth"
import { getRefreshToken } from "@/lib/token-store"
import { getInitials } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      // Révocation côté serveur — best effort : la session locale est vidée
      // dans tous les cas, même si l'API est injoignable.
      await authApi.logout(refreshToken).catch(() => undefined)
    }
    clearAuth()
    router.replace("/fr/login")
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm sm:px-6">
      <button
        onClick={toggleSidebar}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 md:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cecj-green/10 text-xs font-bold text-cecj-green">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs leading-tight text-gray-400">{user.role.name}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-md bg-cecj-green px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loggingOut ? "Déconnexion…" : "Déconnexion"}
        </button>
      </div>
    </header>
  )
}
