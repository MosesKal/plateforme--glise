"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { READING_PLANS } from "@/constants/bible"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface PartageWhatsAppProps {
  reading: ReadingHook
}

export function PartageWhatsApp({ reading }: PartageWhatsAppProps) {
  const { t, locale } = useI18n()
  const [copied, setCopied] = useState(false)
  const report = reading.readingReport
  const plan = READING_PLANS[reading.state!.planId]
  const planLabel = locale === "fr" ? plan.labelFr : plan.labelEn
  const todayExtra = Math.max(0, report.todayRead - report.todayGoal)

  const buildMessage = () =>
    [
      t("lectureBibliquePage.report_message_title"),
      "",
      `📅 ${t("lectureBibliquePage.report_plan")} : ${planLabel}`,
      `📖 ${t("lectureBibliquePage.report_progress")} : ${reading.progress.completed}/${reading.progress.total} (${reading.progress.percent}%)`,
      `✅ ${t("lectureBibliquePage.report_consistency")} : ${report.consistencyPercent}%`,
      `🔥 ${t("lectureBibliquePage.report_streak")} : ${report.currentStreak} ${t("lectureBibliquePage.report_days")}`,
      `🏆 ${t("lectureBibliquePage.report_best_streak")} : ${report.longestStreak} ${t("lectureBibliquePage.report_days")}`,
      `📚 ${t("lectureBibliquePage.report_today")} : ${report.todayRead}/${report.todayGoal}${todayExtra > 0 ? ` (+${todayExtra})` : ""}`,
      `➕ ${t("lectureBibliquePage.report_total_extra")} : ${report.totalExtra}`,
      "",
      t("lectureBibliquePage.share_msg_footer"),
      `${window.location.origin}/${locale}/lecture-biblique`,
    ].join("\n")

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener,noreferrer")
  }

  const copyReport = async () => {
    await navigator.clipboard.writeText(buildMessage())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const cards = [
    { value: `${reading.progress.percent}%`, label: t("lectureBibliquePage.report_progress"), color: "text-cecj-green" },
    { value: `${report.consistencyPercent}%`, label: t("lectureBibliquePage.report_consistency"), color: "text-amber-600" },
    { value: `${report.currentStreak} 🔥`, label: t("lectureBibliquePage.report_streak"), color: "text-red-500" },
    { value: `+${report.totalExtra}`, label: t("lectureBibliquePage.report_total_extra"), color: "text-blue-600" },
  ]

  return (
    <section className="bg-cecj-tint py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()} className="space-y-8">
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              {t("lectureBibliquePage.share_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.report_title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{t("lectureBibliquePage.report_subtitle")}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="bg-cecj-green px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-cecj-gold">{planLabel}</p>
              <h3 className="mt-1 text-xl font-bold">{t("lectureBibliquePage.report_card_title")}</h3>
              <p className="mt-1 text-sm text-white/65">
                {reading.progress.completed} / {reading.progress.total} {t("lectureBibliquePage.progress_chapters")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="bg-white p-4 text-center">
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-5">
              <div className="mb-4 flex items-center justify-between rounded-xl bg-cecj-tint px-4 py-3 text-sm">
                <span className="text-gray-600">{t("lectureBibliquePage.report_today")}</span>
                <span className="font-bold text-cecj-green">
                  {report.todayRead}/{report.todayGoal}
                  {todayExtra > 0 && <span className="ml-1 text-blue-600">+{todayExtra}</span>}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1DA851]"
                >
                  <span aria-hidden>◉</span>
                  {t("lectureBibliquePage.share_btn")}
                </button>
                <button
                  onClick={copyReport}
                  className="rounded-full border border-cecj-green/20 px-5 py-3 text-sm font-semibold text-cecj-green transition hover:bg-cecj-green/5"
                >
                  {copied ? t("lectureBibliquePage.report_copied") : t("lectureBibliquePage.report_copy")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
