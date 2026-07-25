"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import {
  BIBLE_BOOKS,
  READING_PLANS,
  getBookById,
  type BookId,
  type ReadingPlanId,
} from "@/constants/bible"
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

const ORDERED_BOOKS = [...BIBLE_BOOKS].sort(
  (a, b) => a.columnIndex - b.columnIndex || a.orderInColumn - b.orderInColumn,
)

type StartMode = "beginning" | "continue"

export function PlanSelector({ reading }: PlanSelectorProps) {
  const { t, locale } = useI18n()
  const activePlanId = reading.state?.planId ?? null
  const [pendingPlanId, setPendingPlanId] = useState<ReadingPlanId | null>(null)
  const [startMode, setStartMode] = useState<StartMode>("beginning")
  const [bookId, setBookId] = useState<BookId>("GEN")
  const [chapter, setChapter] = useState(1)
  const selectedPlan = pendingPlanId ? READING_PLANS[pendingPlanId] : null
  const selectedBook = getBookById(bookId)

  const openSetup = (planId: ReadingPlanId) => {
    if (planId === activePlanId) return
    setPendingPlanId(planId)
    setStartMode("beginning")
    setBookId("GEN")
    setChapter(1)
  }

  const closeSetup = () => setPendingPlanId(null)

  const confirmSetup = () => {
    if (!pendingPlanId) return
    reading.selectPlan(
      pendingPlanId,
      startMode === "continue" ? `${bookId}_${chapter}` : undefined,
    )
    closeSetup()
  }

  const selectBook = (nextBookId: BookId) => {
    setBookId(nextBookId)
    setChapter(1)
  }

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
                    onClick={() => openSetup(plan.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openSetup(plan.id)}
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
                      onClick={(e) => { e.stopPropagation(); openSetup(plan.id) }}
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

      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              confirmSetup()
            }}
            className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bible-setup-title"
          >
            <div className="bg-cecj-green px-6 py-6 text-white sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-cecj-gold/20 px-3 py-1 text-xs font-semibold text-cecj-gold">
                    {t("lectureBibliquePage.setup_badge")}
                  </span>
                  <h2 id="bible-setup-title" className="mt-3 text-2xl font-bold">
                    {t("lectureBibliquePage.setup_title")}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                    {t("lectureBibliquePage.setup_desc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeSetup}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20"
                  aria-label={t("lectureBibliquePage.setup_close")}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8">
              <div className="rounded-2xl border border-cecj-green/15 bg-cecj-green/5 px-4 py-3 text-sm text-gray-700">
                <span className="font-medium">{t("lectureBibliquePage.setup_plan")}</span>{" "}
                <span className="font-bold text-cecj-green">
                  {locale === "fr" ? selectedPlan.labelFr : selectedPlan.labelEn}
                </span>
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-3 text-sm font-bold text-gray-900">
                  {t("lectureBibliquePage.setup_position_label")}
                </legend>

                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors",
                    startMode === "beginning"
                      ? "border-cecj-green bg-cecj-green/5"
                      : "border-gray-200 hover:border-cecj-green/30",
                  )}
                >
                  <input
                    type="radio"
                    name="start-mode"
                    checked={startMode === "beginning"}
                    onChange={() => setStartMode("beginning")}
                    className="mt-1 h-4 w-4 accent-cecj-green"
                  />
                  <span>
                    <span className="block font-semibold text-gray-900">
                      {t("lectureBibliquePage.setup_beginning_title")}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      {t("lectureBibliquePage.setup_beginning_desc")}
                    </span>
                  </span>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors",
                    startMode === "continue"
                      ? "border-cecj-green bg-cecj-green/5"
                      : "border-gray-200 hover:border-cecj-green/30",
                  )}
                >
                  <input
                    type="radio"
                    name="start-mode"
                    checked={startMode === "continue"}
                    onChange={() => setStartMode("continue")}
                    className="mt-1 h-4 w-4 accent-cecj-green"
                  />
                  <span>
                    <span className="block font-semibold text-gray-900">
                      {t("lectureBibliquePage.setup_continue_title")}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      {t("lectureBibliquePage.setup_continue_desc")}
                    </span>
                  </span>
                </label>
              </fieldset>

              {startMode === "continue" && (
                <div className="space-y-4 rounded-2xl border border-cecj-gold/40 bg-amber-50/60 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
                    <label className="space-y-2 text-sm font-semibold text-gray-800">
                      <span>{t("lectureBibliquePage.setup_book_label")}</span>
                      <select
                        value={bookId}
                        onChange={(event) => selectBook(event.target.value as BookId)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal text-gray-900 outline-none transition focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/15"
                      >
                        {ORDERED_BOOKS.map((book) => (
                          <option key={book.id} value={book.id}>
                            {locale === "fr" ? book.nameFr : book.nameEn}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-semibold text-gray-800">
                      <span>{t("lectureBibliquePage.setup_chapter_label")}</span>
                      <select
                        value={chapter}
                        onChange={(event) => setChapter(Number(event.target.value))}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal text-gray-900 outline-none transition focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/15"
                      >
                        {Array.from({ length: selectedBook.chapters }, (_, index) => index + 1).map((chapterNumber) => (
                          <option key={chapterNumber} value={chapterNumber}>
                            {chapterNumber}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <p className="text-xs leading-relaxed text-amber-900/75">
                    {t("lectureBibliquePage.setup_summary")
                      .replace("{book}", locale === "fr" ? selectedBook.nameFr : selectedBook.nameEn)
                      .replace("{chapter}", String(chapter))}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={closeSetup}
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-white"
              >
                {t("lectureBibliquePage.setup_cancel")}
              </button>
              <button
                type="submit"
                className="rounded-full bg-cecj-green px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cecj-green/90"
              >
                {t("lectureBibliquePage.setup_confirm")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
