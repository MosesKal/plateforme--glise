"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useUiStore } from "@/store/ui.store"

interface NavLeaf {
  label: string
  href: string
}

type NavItem = NavLeaf | { label: string; children: NavLeaf[] }

// Regroupement aligné sur les périmètres RBAC (ex. « Responsable Communication » :
// galerie, témoignages, médias) — 6 entrées de premier niveau au lieu de 13.
const navItems: NavItem[] = [
  { label: "Tableau de bord", href: ADMIN_ROUTES.dashboard },
  {
    label: "Enseignements",
    children: [
      { label: "Vue d'ensemble",    href: ADMIN_ROUTES.enseignements       },
      { label: "Audios",            href: ADMIN_ROUTES.enseignementsAudios },
      { label: "Vidéos",            href: ADMIN_ROUTES.enseignementsVideos },
      { label: "Écrits (PDF)",      href: ADMIN_ROUTES.enseignementsEcrits },
      { label: "Thèmes & orateurs", href: ADMIN_ROUTES.enseignementsThemes },
    ],
  },
  {
    label: "Vie de l'église",
    children: [
      { label: "Événements", href: ADMIN_ROUTES.evenements },
      { label: "Programme",  href: ADMIN_ROUTES.programme  },
    ],
  },
  {
    label: "Communication",
    children: [
      { label: "Galerie",     href: ADMIN_ROUTES.galerie     },
      { label: "Témoignages", href: ADMIN_ROUTES.temoignages },
      { label: "Contact",     href: ADMIN_ROUTES.contact     },
      { label: "Pages",       href: ADMIN_ROUTES.pages       },
    ],
  },
  {
    label: "Organisation",
    children: [
      { label: "Extensions",   href: ADMIN_ROUTES.extensions   },
      { label: "Départements", href: ADMIN_ROUTES.departements },
      { label: "Leadership",   href: ADMIN_ROUTES.leaders      },
    ],
  },
  {
    label: "Administration",
    children: [
      { label: "Utilisateurs", href: ADMIN_ROUTES.utilisateurs },
      { label: "Rôles",        href: ADMIN_ROUTES.roles        },
    ],
  },
]

/** Actif sur la page exacte ET ses sous-pages (ex. /admin/evenements/nouveau). */
function isActive(pathname: string, href: string): boolean {
  if (href === ADMIN_ROUTES.dashboard) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Actif pour un enfant de groupe : « Audios » (/admin/enseignements) est un préfixe
 * de tous ses frères — il ne doit pas s'allumer quand un frère plus spécifique matche.
 */
function isChildActive(pathname: string, child: NavLeaf, siblings: NavLeaf[]): boolean {
  if (pathname === child.href) return true
  if (!pathname.startsWith(`${child.href}/`)) return false
  return !siblings.some((s) => s.href !== child.href && isActive(pathname, s.href))
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** Groupe dépliable — s'ouvre automatiquement quand une de ses pages est active. */
function SidebarGroup({
  label,
  childItems,
  pathname,
  onNavigate,
}: {
  label: string
  childItems: NavLeaf[]
  pathname: string
  onNavigate?: () => void
}) {
  const groupActive = childItems.some((c) => isActive(pathname, c.href))
  const [open, setOpen] = useState(groupActive)

  // Quand on navigue vers une page du groupe, il se déplie — recalé pendant le
  // rendu (pattern React « adjusting state during render »), sans effet.
  const [prevActive, setPrevActive] = useState(groupActive)
  if (groupActive !== prevActive) {
    setPrevActive(groupActive)
    if (groupActive) setOpen(true)
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
          groupActive
            ? "bg-white/15 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        {label}
        <ChevronIcon className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/15 pl-3">
          {childItems.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                isChildActive(pathname, child, childItems)
                  ? "bg-white/15 font-medium text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Image
          src="/Logo C.E.C.j-BLANC.png"
          alt="C.E.C.J.C."
          width={40}
          height={40}
          className="h-10 w-auto object-contain"
        />
        <span className="text-sm font-semibold uppercase tracking-widest">C.E.C.J.C.</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) =>
          "children" in item ? (
            <SidebarGroup
              key={item.label}
              label={item.label}
              childItems={item.children}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ) : (
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
          )
        )}
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
