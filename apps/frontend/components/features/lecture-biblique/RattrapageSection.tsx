"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { fadeUp, stagger, inView } from "@/lib/motion"

interface RattrapageSectionProps {
  retard: { chapters: number; extraPerDay: number }
}

export function RattrapageSection({ retard }: RattrapageSectionProps) {
  const { t } = useI18n()

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()}>
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-6"
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
                ⏰
              </span>
              <div>
                <span className="mb-1 inline-block rounded-full bg-amber-200 px-3 py-0.5 text-xs font-semibold text-amber-800">
                  {t("lectureBibliquePage.catchup_badge")}
                </span>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {t("lectureBibliquePage.catchup_title")}
                </h3>
                <p className="mb-3 text-base font-semibold text-amber-700">
                  {retard.chapters} {t("lectureBibliquePage.catchup_behind")}
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {t("lectureBibliquePage.catchup_suggestion").replace(
                    "{n}",
                    String(retard.extraPerDay),
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
