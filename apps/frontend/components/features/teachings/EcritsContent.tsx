"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { SITE_ROUTES } from "@/constants/routes"

/** Page « Enseignements écrits » — module PDF à venir (structure de navigation prête). */
export function EcritsContent() {
  const { t, locale } = useI18n()

  const lp = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-white pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-14 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cecj-gold"
            >
              {t("teachings.ecrits.badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              {t("teachings.ecrits.title")}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-base text-white/70 leading-relaxed md:text-lg"
            >
              {t("teachings.ecrits.intro")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* À venir */}
      <section className="mx-auto max-w-3xl px-4 pt-16 text-center lg:px-8">
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cecj-green/8 text-cecj-green">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-900">{t("teachings.ecrits.comingSoon")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            {t("teachings.ecrits.comingSoonDetail")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={lp(SITE_ROUTES.enseignementsAudios)}
              className="inline-flex items-center rounded-lg bg-cecj-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cecj-green/90"
            >
              {t("teachings.ecrits.ctaAudios")}
            </Link>
            <Link
              href={lp(SITE_ROUTES.enseignementsVideos)}
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-cecj-green hover:text-cecj-green"
            >
              {t("teachings.ecrits.ctaVideos")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
