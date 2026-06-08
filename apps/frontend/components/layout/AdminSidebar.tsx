"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_ROUTES } from "@/constants/routes"

const navItems = [
  { label: "Tableau de bord", href: ADMIN_ROUTES.dashboard },
  { label: "Utilisateurs",    href: ADMIN_ROUTES.utilisateurs },
  { label: "Rôles",           href: ADMIN_ROUTES.roles },
  { label: "Événements",      href: ADMIN_ROUTES.evenements },
  { label: "Galerie",         href: ADMIN_ROUTES.galerie },
  { label: "Extensions",      href: ADMIN_ROUTES.extensions },
  { label: "Pages",           href: ADMIN_ROUTES.pages },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
        <Image
          src="/Logo C.E.C.j.png"
          alt="C.E.C.J."
          width={32}
          height={32}
          className="h-8 w-auto object-contain"
        />
        <div>
          <p className="text-xs font-bold text-cecj-green">C.E.C.J.</p>
          <p className="text-[10px] text-gray-400">Backoffice</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === ADMIN_ROUTES.dashboard
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-cecj-green text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-3">
        <Link
          href="/"
          className="text-xs text-gray-400 transition-colors hover:text-cecj-green"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  )
}
