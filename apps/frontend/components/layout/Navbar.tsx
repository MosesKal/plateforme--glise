"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SITE_ROUTES } from "@/constants/routes"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useI18n } from "@/components/providers/I18nProvider"

interface NavLink {
  label: string
  href: string
  isActive: boolean
}

type NavItem =
  | ({ type: "link" } & NavLink)
  | { type: "dropdown"; label: string; align?: "left" | "right"; links: NavLink[] }

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** Dropdown desktop autonome : cliquer ailleurs (y compris sur l'autre dropdown) le referme. */
function DesktopDropdown({ label, links, align = "left" }: { label: string; links: NavLink[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const isActive = links.some((l) => l.isActive)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <li className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
          isActive || open
            ? "bg-white/20 text-white"
            : "text-white/80 hover:text-white hover:bg-white/10",
        )}
      >
        {label}
        <ChevronIcon className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full mt-2 min-w-[190px] rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-black/8",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2.5 text-sm transition-colors",
                link.isActive
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
  )
}

/** Sous-section repliable du menu mobile. */
function MobileAccordion({ label, links, onNavigate }: { label: string; links: NavLink[]; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)
  const isActive = links.some((l) => l.isActive)

  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded px-3 py-3 text-sm font-medium",
          isActive ? "bg-white/20 text-white" : "text-white/80 hover:text-white",
        )}
      >
        {label}
        <ChevronIcon className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <ul className="ml-3 mt-1 space-y-0.5 border-l border-white/15 pl-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded px-3 py-2.5 text-sm",
                  link.isActive
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
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { locale, t } = useI18n()

  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)

  // Actif sur la page exacte ET ses sous-pages (ex. /enseignements/videos/...),
  // sauf pour l'accueil qui ne matche que lui-meme.
  const isLinkActive = (href: string) =>
    pathname === href || (href !== lp("/") && pathname.startsWith(`${href}/`))

  const teachingsLinks: NavLink[] = [
    {
      label: t("nav.enseignements_tous"),
      href: lp(SITE_ROUTES.enseignements),
      // Le hub uniquement — ses sous-pages ont chacune leur entrée dédiée.
      isActive: pathname === lp(SITE_ROUTES.enseignements),
    },
    {
      label: t("nav.enseignements_audios"),
      href: lp(SITE_ROUTES.enseignementsAudios),
      isActive: isLinkActive(lp(SITE_ROUTES.enseignementsAudios)),
    },
    {
      label: t("nav.enseignements_videos"),
      href: lp(SITE_ROUTES.enseignementsVideos),
      isActive: isLinkActive(lp(SITE_ROUTES.enseignementsVideos)),
    },
    {
      label: t("nav.enseignements_ecrits"),
      href: lp(SITE_ROUTES.enseignementsEcrits),
      isActive: isLinkActive(lp(SITE_ROUTES.enseignementsEcrits)),
    },
  ]

  const exploreLinks: NavLink[] = [
    { label: t("nav.galerie"),     href: lp(SITE_ROUTES.galerie),         isActive: isLinkActive(lp(SITE_ROUTES.galerie)) },
    { label: t("nav.temoignages"), href: lp(SITE_ROUTES.temoignages),     isActive: isLinkActive(lp(SITE_ROUTES.temoignages)) },
    { label: t("nav.contact"),     href: lp(SITE_ROUTES.contact),         isActive: isLinkActive(lp(SITE_ROUTES.contact)) },
  ]

  const navItems: NavItem[] = [
    { type: "link", label: t("nav.accueil"), href: lp(SITE_ROUTES.accueil), isActive: isLinkActive(lp(SITE_ROUTES.accueil)) },
    { type: "link", label: t("nav.apropos"), href: lp(SITE_ROUTES.apropos), isActive: isLinkActive(lp(SITE_ROUTES.apropos)) },
    { type: "dropdown", label: t("nav.enseignements"), links: teachingsLinks },
    { type: "link", label: t("nav.lecture"), href: lp(SITE_ROUTES.lectureBiblique), isActive: isLinkActive(lp(SITE_ROUTES.lectureBiblique)) },
    { type: "link", label: t("nav.evenements"), href: lp(SITE_ROUTES.evenements), isActive: isLinkActive(lp(SITE_ROUTES.evenements)) },
    { type: "link", label: t("nav.adhesion"),   href: lp(SITE_ROUTES.adhesion),   isActive: isLinkActive(lp(SITE_ROUTES.adhesion)) },
    { type: "link", label: t("nav.extensions"), href: lp(SITE_ROUTES.extensions), isActive: isLinkActive(lp(SITE_ROUTES.extensions)) },
    { type: "dropdown", label: t("nav.explorer"), align: "right", links: exploreLinks },
  ]

  return (
    <header className="sticky top-0 z-50 bg-cecj-green shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href={lp("/")} className="flex items-center">
          <Image
            src="/Logo C.E.C.j-BLANC.png"
            alt="Logo C.E.C.J.C."
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.type === "dropdown" ? (
              <DesktopDropdown key={item.label} label={item.label} links={item.links} align={item.align} />
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                    item.isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ),
          )}
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
            {navItems.map((item) =>
              item.type === "dropdown" ? (
                <MobileAccordion
                  key={item.label}
                  label={item.label}
                  links={item.links}
                  onNavigate={() => setMenuOpen(false)}
                />
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block rounded px-3 py-3 text-sm font-medium",
                      item.isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
