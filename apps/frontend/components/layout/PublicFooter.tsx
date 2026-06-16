"use client"

import Link from "next/link"
import Image from "next/image"
import { SITE_ROUTES } from "@/constants/routes"
import { useI18n } from "@/components/providers/I18nProvider"

export function PublicFooter() {
  const { locale, t } = useI18n()

  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)

  const footerLinks = [
    {
      title: t("footer.nav_title"),
      links: [
        { label: t("nav.accueil"),       href: lp(SITE_ROUTES.accueil) },
        { label: t("nav.presentation"),  href: lp(SITE_ROUTES.presentation) },
        { label: t("nav.vision"),        href: lp(SITE_ROUTES.vision) },
        { label: t("nav.mission"),       href: lp(SITE_ROUTES.mission) },
      ],
    },
    {
      title: t("footer.community_title"),
      links: [
        { label: t("nav.extensions"),    href: lp(SITE_ROUTES.extensions) },
        { label: t("nav.evenements"),    href: lp(SITE_ROUTES.evenements) },
        { label: t("nav.galerie"),    href: lp(SITE_ROUTES.galerie) },
      ],
    },
    {
      title: t("footer.contact_title"),
      links: [
        { label: t("nav.contact"),       href: lp(SITE_ROUTES.contact) },
      ],
    },
  ]

  return (
    <footer className="bg-cecj-green text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <Image
              src="/Logo C.E.C.j-BLANC.png"
              alt="Logo C.E.C.J."
              width={64}
              height={64}
              className="h-16 w-auto object-contain"
            />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-2 text-xs text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} C.E.C.J. — {t("footer.rights")}</span>
        </div>
      </div>
    </footer>
  )
}
