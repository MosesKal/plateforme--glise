"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useUiStore } from "@/store/ui.store"
import { authApi } from "@/lib/api/auth"
import { getRefreshToken } from "@/lib/token-store"
import { getLoginUrl } from "@/lib/auth/getLoginUrl"
import { cn, getInitials } from "@/lib/utils"
import { ChangePasswordModal } from "@/components/features/auth/ChangePasswordModal"

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function Header() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const [menuOpen, setMenuOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      // Révocation côté serveur — best effort : la session locale est vidée
      // dans tous les cas, même si l'API est injoignable.
      await authApi.logout(refreshToken).catch(() => undefined)
    }
    clearAuth()
    router.replace(getLoginUrl(window.location.pathname))
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

      {/* Menu profil */}
      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors",
              menuOpen ? "bg-gray-100" : "hover:bg-gray-50",
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cecj-green text-xs font-bold text-white">
              {getInitials(user.firstName, user.lastName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-gray-900">
                {user.firstName} {user.lastName}
              </span>
              <span className="block text-xs leading-tight text-gray-400">{user.role.name}</span>
            </span>
            <ChevronIcon
              className={cn("h-3.5 w-3.5 text-gray-400 transition-transform duration-200", menuOpen && "rotate-180")}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/8">
              {/* Identité */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cecj-green text-sm font-bold text-white">
                  {getInitials(user.firstName, user.lastName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-cecj-green/10 px-2 py-0.5 text-[11px] font-semibold text-cecj-green">
                    {user.role.name}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1.5">
                <button
                  onClick={() => { setMenuOpen(false); setPasswordModalOpen(true) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-cecj-green"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                    />
                  </svg>
                  Changer mon mot de passe
                </button>
              </div>

              <div className="border-t border-gray-100 py-1.5">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                  {loggingOut ? "Déconnexion…" : "Déconnexion"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </header>
  )
}
