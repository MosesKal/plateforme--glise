"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SITE_ROUTES } from "@/constants/routes"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useI18n } from "@/components/providers/I18nProvider"

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false)
  const { locale, t } = useI18n()
  const dropdownRef = useRef<HTMLLIElement>(null)

  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)

  // Actif sur la page exacte ET ses sous-pages (ex. /enseignements/audio/...),
  // sauf pour l'accueil qui ne matche que lui-meme.
  const isLinkActive = (href: string) =>
    pathname === href || (href !== lp("/") && pathname.startsWith(`${href}/`))

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinks = [
    { label: t("nav.accueil"),       href: lp(SITE_ROUTES.accueil) },
    { label: t("nav.apropos"),       href: lp(SITE_ROUTES.apropos) },
    { label: t("nav.enseignements"), href: lp(SITE_ROUTES.enseignements) },
    { label: t("nav.evenements"),    href: lp(SITE_ROUTES.evenements) },
    { label: t("nav.adhesion"),      href: lp(SITE_ROUTES.adhesion) },
    { label: t("nav.extensions"),    href: lp(SITE_ROUTES.extensions) },
  ]

  const exploreLinks = [
    { label: t("nav.galerie"),     href: lp(SITE_ROUTES.galerie) },
    { label: t("nav.temoignages"), href: lp(SITE_ROUTES.temoignages) },
    { label: t("nav.lecture"),     href: lp(SITE_ROUTES.lectureBiblique) },
    { label: t("nav.contact"),     href: lp(SITE_ROUTES.contact) },
  ]

  const isExploreActive = exploreLinks.some((l) => isLinkActive(l.href))

  return (
    <header className="sticky top-0 z-50 bg-cecj-green shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href={lp("/")} className="flex items-center gap-3">
          <Image
            src="/Logo C.E.C.j-BLANC.png"
            alt="Logo C.E.C.J.C."
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
          <span className="hidden text-sm font-semibold uppercase tracking-widest text-white sm:block">
            C.E.C.J.C.
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
                  isLinkActive(link.href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Explorer dropdown */}
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                isExploreActive || dropdownOpen
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10",
              )}
            >
              {t("nav.explorer")}
              <ChevronIcon className={cn("h-3.5 w-3.5 transition-transform duration-200", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[190px] rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-black/8">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDropdownOpen(false)}
                    className={cn(
                      "block px-4 py-2.5 text-sm transition-colors",
                      isLinkActive(link.href)
                        ? "bg-cecj-green/8 font-semibold text-cecj-green"
                        : "text-gray-700 hover:bg-cecj-green/5 hover:text-cecj-green",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 lg:hidden"
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
                    "block rounded px-3 py-3 text-sm font-medium",
                    isLinkActive(link.href)
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Explorer sub-section mobile */}
            <li>
              <button
                onClick={() => setMobileExploreOpen((v) => !v)}
                className={cn(
                  "flex w-full items-center justify-between rounded px-3 py-3 text-sm font-medium",
                  isExploreActive ? "bg-white/20 text-white" : "text-white/80 hover:text-white",
                )}
              >
                {t("nav.explorer")}
                <ChevronIcon className={cn("h-4 w-4 transition-transform duration-200", mobileExploreOpen && "rotate-180")} />
              </button>

              {mobileExploreOpen && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-white/15 pl-3">
                  {exploreLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => { setMenuOpen(false); setMobileExploreOpen(false) }}
                        className={cn(
                          "block rounded px-3 py-2.5 text-sm",
                          isLinkActive(link.href)
                            ? "font-semibold text-white"
                            : "text-white/65 hover:text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
