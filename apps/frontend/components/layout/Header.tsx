"use client"

import Link from "next/link"
import { AUTH_ROUTES } from "@/constants/routes"

export function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Administration</span>
        <Link
          href={AUTH_ROUTES.login}
          className="rounded-md bg-cecj-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Déconnexion
        </Link>
      </div>
    </header>
  )
}
