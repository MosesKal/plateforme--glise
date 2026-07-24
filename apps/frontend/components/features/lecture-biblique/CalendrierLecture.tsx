"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading, CalendarDay } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface CalendrierLectureProps {
  reading: ReadingHook
}

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DOW_FR    = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
const DOW_EN    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

function calendarGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const offset   = (firstDow + 6) % 7 // Mon-first
  const total    = new Date(year, month + 1, 0).getDate()
  const grid: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function statusForDay(days: CalendarDay[], date: string): CalendarDay["status"] | null {
  return days.find((d) => d.date === date)?.status ?? null
}

export function CalendrierLecture({ reading }: CalendrierLectureProps) {
  const { t, locale } = useI18n()
  const now = new Date()
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  )
  const year = displayedMonth.getFullYear()
  const month = displayedMonth.getMonth()
  const grid = calendarGrid(year, month)

  const months = locale === "fr" ? MONTHS_FR : MONTHS_EN
  const dows   = locale === "fr" ? DOW_FR : DOW_EN

  const STATUS_STYLE: Record<CalendarDay["status"], string> = {
    completed: "bg-cecj-green text-white",
    missed:    "bg-red-400 text-white",
    today:     "ring-2 ring-cecj-green bg-white text-cecj-green font-bold",
    future:    "bg-gray-100 text-gray-400",
  }

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`
  const monthData = reading.calendarData.filter((day) => day.date.startsWith(monthPrefix))
  const completed = monthData.filter((d) => d.status === "completed").length
  const missed = monthData.filter((d) => d.status === "missed").length
  const extras = monthData.reduce((sum, day) => sum + day.extraCount, 0)
  const tracked = completed + missed
  const regularity = tracked > 0 ? Math.round((completed / tracked) * 100) : 0
  const planStart = new Date(`${reading.state!.startDate}T00:00:00`)
  const firstMonth = new Date(planStart.getFullYear(), planStart.getMonth(), 1)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const canGoPrevious = displayedMonth > firstMonth
  const canGoNext = displayedMonth < currentMonth

  return (
    <section className="bg-cecj-tint py-16 lg:py-20">
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()} className="space-y-8">
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-4 py-1.5 text-sm font-semibold text-cecj-green">
              {t("lectureBibliquePage.calendar_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.calendar_title")}
            </h2>
          </motion.div>

          {/* Calendar card */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            {/* Month label */}
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                disabled={!canGoPrevious}
                onClick={() => setDisplayedMonth(new Date(year, month - 1, 1))}
                aria-label={t("lectureBibliquePage.calendar_previous")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-cecj-green hover:text-cecj-green disabled:cursor-not-allowed disabled:opacity-30"
              >
                ←
              </button>
              <p className="text-center text-base font-semibold text-gray-700">
                {months[month]} {year}
              </p>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setDisplayedMonth(new Date(year, month + 1, 1))}
                aria-label={t("lectureBibliquePage.calendar_next")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-cecj-green hover:text-cecj-green disabled:cursor-not-allowed disabled:opacity-30"
              >
                →
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {dows.map((d) => (
                <div key={d} className="py-1 text-center text-xs font-semibold uppercase text-gray-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {grid.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} />
                }
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const status = statusForDay(reading.calendarData, dateStr)
                const calendarDay = reading.calendarData.find((entry) => entry.date === dateStr)

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-all",
                      status ? STATUS_STYLE[status] : "text-gray-400",
                    )}
                    aria-label={`${day} ${months[month]} : ${status ?? ""}, ${calendarDay?.readCount ?? 0} ${t("lectureBibliquePage.progress_chapters")}`}
                    title={calendarDay?.extraCount ? `+${calendarDay.extraCount} ${t("lectureBibliquePage.calendar_extra")}` : undefined}
                  >
                    {day}
                    {Boolean(calendarDay?.extraCount) && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1 text-[8px] font-bold leading-4 text-white shadow-sm">
                        +{calendarDay!.extraCount}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border-t border-gray-100 pt-4">
              {[
                { color: "bg-cecj-green", label: t("lectureBibliquePage.calendar_completed") },
                { color: "bg-red-400",    label: t("lectureBibliquePage.calendar_missed") },
                { color: "bg-gray-100 border border-gray-200", label: t("lectureBibliquePage.calendar_future") },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={cn("h-3 w-3 rounded-sm", color)} />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-green-100 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-cecj-green">{completed}</p>
              <p className="text-xs text-gray-500">{t("lectureBibliquePage.calendar_completed")}</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-red-400">{missed}</p>
              <p className="text-xs text-gray-500">{t("lectureBibliquePage.calendar_missed")}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{extras > 0 ? `+${extras}` : 0}</p>
              <p className="text-xs text-gray-500">{t("lectureBibliquePage.calendar_extra_short")}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-600">{regularity}%</p>
              <p className="text-xs text-gray-500">{t("lectureBibliquePage.calendar_regularity")}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
