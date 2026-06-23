"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { READING_PLANS, type ReadingPlanId } from "@/constants/bible"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface PlanSelectorProps {
  reading: ReadingHook
}

const PLAN_COLOR: Record<ReadingPlanId, string> = {
  "8months": "from-teal-50 to-cyan-50 border-teal-200",
  "6months": "from-blue-50 to-indigo-50 border-blue-200",
  "4months": "from-amber-50 to-orange-50 border-amber-200",
  "3months": "from-yellow-50 to-amber-50 border-yellow-200",
  "2months": "from-red-50 to-rose-50 border-red-200",
  "1month":  "from-purple-50 to-violet-50 border-purple-200",
}

const PLAN_ACTIVE: Record<ReadingPlanId, string> = {
  "8months": "ring-2 ring-cecj-green border-cecj-green bg-gradient-to-br from-cecj-green/5 to-teal-50",
  "6months": "ring-2 ring-cecj-green border-cecj-green bg-gradient-to-br from-cecj-green/5 to-teal-50",
  "4months": "ring-2 ring-cecj-green border-cecj-green bg-gradient-to-br from-cecj-green/5 to-teal-50",
  "3months": "ring-2 ring-cecj-green border-cecj-green bg-gradient-to-br from-cecj-green/5 to-teal-50",
  "2months": "ring-2 ring-cecj-green border-cecj-green bg-gradient-to-br from-cecj-green/5 to-teal-50",
  "1month":  "ring-2 ring-cecj-green border-cecj-green bg-gradient-to-br from-cecj-green/5 to-teal-50",
}

export function PlanSelector({ reading }: PlanSelectorProps) {
  const { t, locale } = useI18n()
  const activePlanId = reading.state?.planId ?? null

  return (
    <section className="bg-white py-16 lg:py-20" id="plan-selector">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()} className="space-y-10">
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-cecj-gold/20 px-4 py-1.5 text-sm font-semibold text-amber-700">
              {t("lectureBibliquePage.plan_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.plan_title")}
            </h2>
          </motion.div>

          {/* Plan cards */}
          <motion.div
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {(Object.values(READING_PLANS) as (typeof READING_PLANS)[ReadingPlanId][]).map((plan) => {
              const isActive = activePlanId === plan.id
              const morningCount = plan.morningChapters
              const afternoonCount = plan.afternoonChapters

              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={cn(
                      "relative flex h-full cursor-pointer flex-col rounded-2xl border-2 bg-gradient-to-br p-6 transition-all duration-300",
                      isActive
                        ? PLAN_ACTIVE[plan.id]
                        : `${PLAN_COLOR[plan.id]} hover:border-cecj-green/40 hover:shadow-md`,
                    )}
                    onClick={() => reading.selectPlan(plan.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && reading.selectPlan(plan.id)}
                    aria-pressed={isActive}
                    aria-label={locale === "fr" ? plan.labelFr : plan.labelEn}
                  >
                    {/* Active badge */}
                    {isActive && (
                      <span className="absolute right-3 top-3 rounded-full bg-cecj-green px-2 py-0.5 text-xs font-semibold text-white">
                        {t("lectureBibliquePage.plan_selected")}
                      </span>
                    )}

                    {/* Label */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {locale === "fr" ? plan.labelFr : plan.labelEn}
                      </h3>
                    </div>

                    {/* Daily schedule */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cecj-green/10 text-xs">
                          🌅
                        </span>
                        <p className="text-sm leading-snug text-gray-700">
                          <span className="font-semibold text-cecj-green">{morningCount}</span>{" "}
                          {t("lectureBibliquePage.plan_chapters")}{" "}
                          {t("lectureBibliquePage.plan_morning")}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cecj-gold/20 text-xs">
                          🌆
                        </span>
                        <p className="text-sm leading-snug text-gray-700">
                          <span className="font-semibold text-cecj-green">{afternoonCount}</span>{" "}
                          {t("lectureBibliquePage.plan_chapters")}{" "}
                          {t("lectureBibliquePage.plan_afternoon")}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); reading.selectPlan(plan.id) }}
                      className={cn(
                        "mt-5 w-full rounded-full py-2.5 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-cecj-green text-white"
                          : "bg-gray-900 text-white hover:bg-cecj-green",
                      )}
                    >
                      {isActive
                        ? `✓ ${t("lectureBibliquePage.plan_selected")}`
                        : t("lectureBibliquePage.plan_select")}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
