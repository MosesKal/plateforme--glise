"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { fadeUp, stagger, inView } from "@/lib/motion"

interface HeroSectionProps {
  hasPlan: boolean
}

export function HeroSection({ hasPlan }: HeroSectionProps) {
  const { t, locale } = useI18n()

  const scrollToPlan = () => {
    document.getElementById("plan-selector")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden bg-cecj-green py-24 lg:py-32">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cecj-gold/10" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/3" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
        <motion.div variants={stagger} {...inView()}>
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1.5 text-sm font-medium text-cecj-gold">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              {t("lectureBibliquePage.hero_badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="mb-4 font-decorative text-4xl font-bold text-white lg:text-6xl"
          >
            {t("lectureBibliquePage.hero_title")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/80"
          >
            {t("lectureBibliquePage.hero_subtitle")}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp}>
            <button
              onClick={scrollToPlan}
              className="inline-flex items-center gap-2 rounded-full bg-cecj-gold px-8 py-4 text-base font-semibold text-cecj-green shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl"
            >
              {hasPlan
                ? t("lectureBibliquePage.reading_title")
                : t("lectureBibliquePage.hero_cta")}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
