import Link from "next/link"
import Image from "next/image"
import { SITE_ROUTES } from "@/constants/routes"

const footerLinks = [
  {
    title: "Navigation",
    links: [
      { label: "Accueil",      href: SITE_ROUTES.accueil },
      { label: "Présentation", href: SITE_ROUTES.presentation },
      { label: "Vision",       href: SITE_ROUTES.vision },
      { label: "Mission",      href: SITE_ROUTES.mission },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Leadership",   href: SITE_ROUTES.leadership },
      { label: "Extensions",   href: SITE_ROUTES.extensions },
      { label: "Événements",   href: SITE_ROUTES.evenements },
      { label: "Galerie",      href: SITE_ROUTES.galerie },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Nous contacter", href: SITE_ROUTES.contact },
    ],
  },
]

export function PublicFooter() {
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
              Communauté des Eglise Camps de Jésus-Christ
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
          <span>© {new Date().getFullYear()} C.E.C.J. — Tous droits réservés.</span>
          <span className="flex items-center gap-1.5">
            Développé par
            <Link
              href="https://moseskalunga.com/fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                MK
              </span>
              <span className="font-medium text-white/60 hover:text-white">Moses K.</span>
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
