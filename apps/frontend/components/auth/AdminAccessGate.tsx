"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { canAccess, resourceForPath } from "@/lib/permissions"
import { ADMIN_ROUTES } from "@/constants/routes"

/**
 * Barrière d'affichage par rôle pour les pages du backoffice : si le rôle de
 * l'utilisateur n'a pas accès à la ressource du chemin courant, un écran
 * « accès non autorisé » remplace la page (l'API refuserait de toute façon —
 * ceci évite les erreurs 403 brutes à l'écran).
 */
export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  if (!canAccess(user?.role.name, resourceForPath(pathname))) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white px-8 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-900">Accès non autorisé</h2>
          <p className="mt-1 text-sm text-gray-400">
            Votre rôle{user ? ` (${user.role.name})` : ""} ne permet pas d&apos;accéder à cette
            section.
          </p>
          <Link
            href={ADMIN_ROUTES.dashboard}
            className="mt-6 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
