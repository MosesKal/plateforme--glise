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
  { label: "Programme",       href: ADMIN_ROUTES.programme },
  { label: "Galerie",         href: ADMIN_ROUTES.galerie },
  { label: "Extensions",      href: ADMIN_ROUTES.extensions },
  { label: "Pages",           href: ADMIN_ROUTES.pages },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col bg-cecj-green text-white">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Image
          src="/Logo C.E.C.j-BLANC.png"
          alt="C.E.C.J."
          width={40}
          height={40}
          className="h-10 w-auto object-contain"
        />
        <span className="text-sm font-semibold uppercase tracking-widest">C.E.C.J.</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
