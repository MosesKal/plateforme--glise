"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { CHURCH_INFO } from "@/constants/church"
import { SITE_ROUTES } from "@/constants/routes"
import { fadeUp, fadeIn, stagger, scaleUp, inView } from "@/lib/motion"

function Icon({ d, className, strokeWidth = 1.5 }: { d: string; className?: string; strokeWidth?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const ICONS = {
  users:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  heart:   "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  shield:  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  book:    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  check:   "M5 13l4 4L19 7",
  phone:   "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  star:    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
}

const BENEFIT_ICONS = [ICONS.users, ICONS.heart, ICONS.shield, ICONS.book]

export function AdhesionContent() {
  const { t, locale } = useI18n()
  const lp = (path: string) => `/${locale}${path}`

  const benefits = t("adhesion.benefits") as { title: string; desc: string }[]

  const whatsappUrl = CHURCH_INFO.socials.whatsappContact ?? "#"

  return (
    <main className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cecj-green py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,203,50,0.08) 0%, transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-6">
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold"
            >
              {t("adhesion.hero_badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {t("adhesion.hero_title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-lg text-white/70">
              {t("adhesion.hero_subtitle")}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-cecj-gold px-6 py-3 text-sm font-semibold text-cecj-green transition-transform hover:scale-105"
              >
                {t("adhesion.cta_whatsapp")}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Pourquoi adhérer ─────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-12">
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-green">
              {t("adhesion.why_badge")}
            </span>
            <h2 className="font-decorative text-5xl leading-none text-cecj-gold md:text-6xl lg:text-7xl">
              {t("adhesion.why_title")}
            </h2>
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cecj-green/10 transition-colors group-hover:bg-cecj-green/20">
                  <Icon d={BENEFIT_ICONS[i]} className="h-5 w-5 text-cecj-green" />
                </div>
                <p className="mb-2 font-semibold text-cecj-green">{b.title}</p>
                <p className="text-sm leading-relaxed text-gray-500">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Portes ouvertes ───────────────────────────────────── */}
      <section className="bg-cecj-green/5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp}>
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-green">
              {t("adhesion.criteria_badge")}
            </span>
            <h2 className="font-decorative text-5xl leading-none text-cecj-green md:text-6xl lg:text-7xl">
              {t("adhesion.criteria_title")}
            </h2>
            <p className="mt-4 max-w-xl text-gray-500">{t("adhesion.criteria_subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="bg-cecj-green/5 py-20 md:py-28">
        <motion.div {...inView()} variants={fadeIn} className="mx-auto max-w-2xl px-4 text-center lg:px-8">
          <h2 className="mb-4 font-decorative text-5xl leading-none text-cecj-green md:text-6xl">
            {t("adhesion.cta_title")}
          </h2>
          <p className="mb-8 text-gray-500">{t("adhesion.cta_subtitle")}</p>
          <div className="flex justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-cecj-green px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {t("adhesion.cta_whatsapp")}
            </a>
          </div>
        </motion.div>
      </section>

    </main>
  )
}
