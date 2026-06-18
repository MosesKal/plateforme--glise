"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { LEADERSHIP, DEPARTEMENTS } from "@/constants/organisation"
import { fadeUp, stagger, scaleUp, inView } from "@/lib/motion"

const DEPT_ICONS: Record<string, string> = {
  music:   "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  users:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  heart:   "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  shield:  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  star:    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  globe:   "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  prayer:  "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11",
  book:    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
      {children}
    </span>
  )
}

export function OrganisationContent() {
  const { t, locale } = useI18n()
  const lang = locale as "fr" | "en"

  const fonctionnementItems = t("organisation.fonctionnement_items") as unknown as { titre: string; desc: string }[]

  return (
    <main className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cecj-green py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="space-y-6">
            <Badge>{t("organisation.hero_badge")}</Badge>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {t("organisation.hero_title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              {t("organisation.hero_subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Nav interne ───────────────────────────────────────────── */}
      <nav className="sticky top-[64px] z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-3 lg:px-8">
          {[
            { anchor: "leadership",    label: t("organisation.nav_leadership") },
            { anchor: "departements",  label: t("organisation.nav_departements") },
            { anchor: "fonctionnement",label: t("organisation.nav_fonctionnement") },
          ].map(({ anchor, label }) => (
            <a
              key={anchor}
              href={`#${anchor}`}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-cecj-green/10 hover:text-cecj-green"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Leadership ───────────────────────────────────────────── */}
      <section id="leadership" className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-4 space-y-3">
            <Badge>{t("organisation.leadership_badge")}</Badge>
            <h2 className="text-3xl font-bold text-cecj-green md:text-4xl">
              {t("organisation.leadership_title")}
            </h2>
            <p className="max-w-xl text-gray-500">{t("organisation.leadership_subtitle")}</p>
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERSHIP.map((leader) => (
              <motion.div
                key={leader.nom}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cecj-green text-xl font-bold text-cecj-gold">
                  {leader.initiales}
                </div>
                <p className="font-bold text-cecj-green">{leader.nom}</p>
                <p className="mb-3 text-sm font-semibold text-cecj-gold">{leader.titre[lang]}</p>
                {leader.description && (
                  <p className="text-sm leading-relaxed text-gray-500">{leader.description[lang]}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Départements ─────────────────────────────────────────── */}
      <section id="departements" className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-4 space-y-3">
            <Badge>{t("organisation.departements_badge")}</Badge>
            <h2 className="text-3xl font-bold text-cecj-green md:text-4xl">
              {t("organisation.departements_title")}
            </h2>
            <p className="max-w-xl text-gray-500">{t("organisation.departements_subtitle")}</p>
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTEMENTS.map((dept) => (
              <motion.div
                key={dept.id}
                variants={scaleUp}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cecj-green/10">
                  <Icon d={DEPT_ICONS[dept.icon]} className="h-5 w-5 text-cecj-green" />
                </div>
                <p className="font-semibold text-cecj-green">{dept.nom[lang]}</p>
                {dept.responsable && (
                  <p className="mt-0.5 text-xs font-medium text-cecj-gold">{dept.responsable}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{dept.description[lang]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Fonctionnement ───────────────────────────────────────── */}
      <section id="fonctionnement" className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-4 space-y-3">
            <Badge>{t("organisation.fonctionnement_badge")}</Badge>
            <h2 className="text-3xl font-bold text-cecj-green md:text-4xl">
              {t("organisation.fonctionnement_title")}
            </h2>
            <p className="max-w-xl text-gray-500">{t("organisation.fonctionnement_subtitle")}</p>
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="mt-10 grid gap-6 sm:grid-cols-2">
            {fonctionnementItems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cecj-gold/20 text-sm font-bold text-cecj-green">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-cecj-green">{item.titre}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </main>
  )
}
