"use client"

import { useAuthStore } from "@/store/auth.store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export function Header() {
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <span className="text-xs font-semibold text-indigo-700">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Déconnexion
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
