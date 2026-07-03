"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useUiStore } from "@/store/ui.store"

const navItems = [
  { label: "Tableau de bord",  href: ADMIN_ROUTES.dashboard     },
  { label: "Utilisateurs",     href: ADMIN_ROUTES.utilisateurs  },
  { label: "Rôles",            href: ADMIN_ROUTES.roles         },
  { label: "Événements",       href: ADMIN_ROUTES.evenements    },
  { label: "Programme",        href: ADMIN_ROUTES.programme     },
  { label: "Galerie",          href: ADMIN_ROUTES.galerie       },
  { label: "Extensions",       href: ADMIN_ROUTES.extensions    },
  { label: "Enseignements",    href: ADMIN_ROUTES.enseignements },
  { label: "Témoignages",      href: ADMIN_ROUTES.temoignages   },
  { label: "Départements",     href: ADMIN_ROUTES.departements  },
  { label: "Leadership",       href: ADMIN_ROUTES.leaders       },
  { label: "Contact",          href: ADMIN_ROUTES.contact       },
  { label: "Pages",            href: ADMIN_ROUTES.pages         },
]

/** Actif sur la page exacte ET ses sous-pages (ex. /admin/enseignements/themes). */
function isActive(pathname: string, href: string): boolean {
  if (href === ADMIN_ROUTES.dashboard) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
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

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              isActive(pathname, item.href)
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, closeSidebar } = useUiStore()

  // Filet de sécurité : le drawer se referme à chaque changement de page,
  // même si la navigation ne passe pas par un clic sur un lien du menu.
  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return (
    <>
      {/* Desktop : colonne permanente */}
      <aside className="hidden h-full w-64 flex-col bg-cecj-green text-white md:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile : drawer avec backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fermer le menu"
            onClick={closeSidebar}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-cecj-green text-white shadow-2xl">
            <SidebarContent pathname={pathname} onNavigate={closeSidebar} />
          </aside>
        </div>
      )}
    </>
  )
}
