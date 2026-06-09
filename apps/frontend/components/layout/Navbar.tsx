"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SITE_ROUTES } from "@/constants/routes"

const navLinks = [
  { label: "Accueil",       href: SITE_ROUTES.accueil },
  { label: "Présentation",  href: SITE_ROUTES.presentation },
  { label: "Vision",        href: SITE_ROUTES.vision },
  { label: "Mission",       href: SITE_ROUTES.mission },
  { label: "Extensions",    href: SITE_ROUTES.extensions },
  { label: "Événements",    href: SITE_ROUTES.evenements },
  { label: "Contact",       href: SITE_ROUTES.contact },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-cecj-green shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href={SITE_ROUTES.accueil} className="flex items-center gap-3">
          <Image
            src="/Logo C.E.C.j-BLANC.png"
            alt="Logo C.E.C.J."
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
          <span className="hidden text-sm font-semibold uppercase tracking-widest text-white sm:block">
            C.E.C.J.
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 lg:hidden"
            aria-label="Menu"
          >
            <span className={cn("block h-0.5 w-6 bg-white transition-transform", menuOpen && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-6 bg-white transition-opacity", menuOpen && "opacity-0")} />
            <span className={cn("block h-0.5 w-6 bg-white transition-transform", menuOpen && "-translate-y-2 -rotate-45")} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-cecj-green px-4 pb-4 lg:hidden">
          <ul className="mt-2 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block rounded px-3 py-2 text-sm font-medium",
                    pathname === link.href
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
