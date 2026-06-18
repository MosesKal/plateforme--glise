"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { fadeIn, fadeUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { SITE_ROUTES } from "@/constants/routes"
import { ProgramPhotosMarquee } from "./ProgramPhotosMarquee"

export function AmbianceCultesSection() {
  const { t, locale } = useI18n()

  return (
    <section className="bg-cecj-page py-14 sm:py-20">
      <motion.div className="text-center" variants={fadeIn} {...inView("-40px")}>
        <motion.p
          variants={fadeUp}
          {...inView()}
          className="mb-4 text-sm font-semibold uppercase tracking-widest text-cecj-green/70 sm:mb-6"
        >
          {t("weeklyProgram.marqueeTitle")}
        </motion.p>
        <ProgramPhotosMarquee />
        <Link
          href={`/${locale}${SITE_ROUTES.extensions}`}
          className="mt-6 inline-block w-full rounded-md bg-cecj-green px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] sm:mt-8 sm:w-auto"
        >
          {t("weeklyProgram.marqueeCta")}
        </Link>
      </motion.div>
    </section>
  )
}
