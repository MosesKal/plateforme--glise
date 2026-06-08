"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_ROUTES } from "@/constants/routes"

const navItems = [
  { label: "Tableau de bord", href: ADMIN_ROUTES.dashboard },
  { label: "Utilisateurs",    href: ADMIN_ROUTES.utilisateurs },
  { label: "Événements",      href: ADMIN_ROUTES.evenements },
  { label: "Extensions",      href: ADMIN_ROUTES.extensions },
  { label: "Galerie",         href: ADMIN_ROUTES.galerie },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-lg font-semibold text-gray-900">Église</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
