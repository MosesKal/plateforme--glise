"use client"

import Link from "next/link"
import Image from "next/image"
import { SITE_ROUTES } from "@/constants/routes"
import { CHURCH_INFO } from "@/constants/church"
import { MapPinIcon, PhoneIcon, FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon, WhatsAppIcon, RadioIcon } from "@/components/ui/icons"
import { SocialLink } from "@/components/ui/SocialLink"
import { useI18n } from "@/components/providers/I18nProvider"

export function PublicFooter() {
  const { locale, t } = useI18n()

  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)
  const phoneHref = `tel:${CHURCH_INFO.contact.phone.replace(/\s+/g, "")}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_INFO.location.fullAddress)}`

  const footerLinks = [
    {
      title: t("footer.nav_title"),
      links: [
        { label: t("nav.accueil"),      href: lp(SITE_ROUTES.accueil) },
        { label: t("nav.apropos"),      href: lp(SITE_ROUTES.apropos) },
        { label: t("nav.leadership"),   href: lp(SITE_ROUTES.leadership) },
        { label: t("nav.temoignages"),  href: lp(SITE_ROUTES.temoignages) },
      ],
    },
    {
      title: t("footer.community_title"),
      links: [
        { label: t("nav.extensions"),    href: lp(SITE_ROUTES.extensions) },
        { label: t("nav.enseignements"), href: lp(SITE_ROUTES.enseignements) },
        { label: t("nav.evenements"),    href: lp(SITE_ROUTES.evenements) },
        { label: t("nav.galerie"),       href: lp(SITE_ROUTES.galerie) },
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
              alt="Logo C.E.C.J.C."
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

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
              {t("footer.contact_title")}
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a href={phoneHref} className="flex items-start gap-2 transition-colors hover:text-white">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{CHURCH_INFO.contact.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {CHURCH_INFO.location.fullAddress}
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-semibold text-cecj-gold hover:underline"
                  >
                    {t("footer.viewMap")} →
                  </a>
                </span>
              </li>
              <li>
                <Link href={lp(SITE_ROUTES.apropos) + "#contact"} className="transition-colors hover:text-white">
                  {t("nav.contact")} →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <span className="text-xs text-white/40">© {new Date().getFullYear()} C.E.C.J.C. — {t("footer.rights")}</span>

          <div className="flex items-center gap-3">
            <span className="sr-only">{t("footer.followUs")}</span>
            <SocialLink
              href={CHURCH_INFO.socials.facebookUrl}
              label={t("footer.ariaFacebook")}
              icon={FacebookIcon}
              comingSoonLabel={t("footer.facebookComingSoon")}
            />
            <SocialLink href={CHURCH_INFO.socials.instagram} label={t("footer.ariaInstagram")} icon={InstagramIcon} />
            <SocialLink href={CHURCH_INFO.socials.tiktok} label={t("footer.ariaTiktok")} icon={TikTokIcon} />
            <SocialLink href={CHURCH_INFO.socials.youtube} label={t("footer.ariaYoutube")} icon={YouTubeIcon} />
            <SocialLink href={CHURCH_INFO.socials.whatsappChannel} label={t("footer.ariaWhatsapp")} icon={WhatsAppIcon} />
            <SocialLink href={CHURCH_INFO.socials.radioUrl} label={t("footer.ariaRadio")} icon={RadioIcon} />
          </div>
        </div>
      </div>
    </footer>
  )
}
