"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface ProgressionGlobaleProps {
  reading: ReadingHook
}

export function ProgressionGlobale({ reading }: ProgressionGlobaleProps) {
  const { t } = useI18n()
  const { completed, total, percent } = reading.progress

  return (
    <section className="bg-cecj-tint py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()} className="space-y-8">
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-4 py-1.5 text-sm font-semibold text-cecj-green">
              {t("lectureBibliquePage.progress_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.progress_title")}
            </h2>
          </motion.div>

          {/* Stats card */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            {/* Numbers */}
            <div className="mb-6 text-center">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold text-cecj-green">{completed}</span>
                <span className="mb-1 text-2xl text-gray-400">/ {total}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("lectureBibliquePage.progress_chapters")}{" "}
                <span className="text-gray-400">({t("lectureBibliquePage.progress_total")})</span>
              </p>
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Progression</span>
                <span className="font-bold text-cecj-green">{percent}%</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-cecj-green to-emerald-500"
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
              {[25, 50, 75].map((milestone) => {
                const reached = percent >= milestone
                return (
                  <div
                    key={milestone}
                    className={`rounded-xl p-3 text-center ${
                      reached ? "bg-cecj-green/10" : "bg-gray-50"
                    }`}
                  >
                    <p className={`text-lg font-bold ${reached ? "text-cecj-green" : "text-gray-400"}`}>
                      {reached ? "✓" : milestone + "%"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {Math.round((total * milestone) / 100)} ch.
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
