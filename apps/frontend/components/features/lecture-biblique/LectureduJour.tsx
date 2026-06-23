"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { bookName } from "@/constants/bible"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface LectureduJourProps {
  reading: ReadingHook
}

export function LectureduJour({ reading }: LectureduJourProps) {
  const { t, locale } = useI18n()
  const loc = locale as "fr" | "en"

  const todayData = reading.todayData
  if (!todayData) return null

  const { morning, afternoon, allDoneToday } = todayData
  const allChapters = [...morning, ...afternoon]
  const completedSet = new Set(reading.state?.completedChapters ?? [])

  if (allChapters.length === 0) {
    return (
      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <span className="text-4xl">🎉</span>
          <p className="mt-4 text-lg font-semibold text-cecj-green">
            {t("lectureBibliquePage.reading_bible_done")}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-16 lg:py-20" id="lecture-du-jour">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()} className="space-y-8">
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-4 py-1.5 text-sm font-semibold text-cecj-green">
              {t("lectureBibliquePage.reading_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.reading_title")}
            </h2>
            {todayData && (
              <p className="mt-2 text-sm text-gray-500">
                {t("lectureBibliquePage.day_number").replace(
                  "{n}",
                  String(todayData.daysSinceStart + 1),
                )}
              </p>
            )}
          </motion.div>

          {/* Completed banner */}
          {allDoneToday && (
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-center"
            >
              <span className="text-2xl">✅</span>
              <p className="mt-1 font-semibold text-green-700">
                {t("lectureBibliquePage.reading_done_all")}
              </p>
            </motion.div>
          )}

          {/* Morning */}
          {morning.length > 0 && (
            <motion.div variants={fadeUp} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <span>🌅</span>
                {t("lectureBibliquePage.reading_morning")}
              </h3>
              <ul className="space-y-2">
                {morning.map((ch) => {
                  const done = completedSet.has(ch.chapterId)
                  return (
                    <li key={ch.chapterId}>
                      <button
                        onClick={() => reading.markChapterComplete(ch.chapterId)}
                        disabled={done}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                          done
                            ? "bg-cecj-green/10 text-cecj-green"
                            : "bg-white text-gray-800 shadow-sm hover:shadow-md hover:bg-cecj-green/5",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                            done
                              ? "border-cecj-green bg-cecj-green text-white"
                              : "border-gray-300 text-transparent",
                          )}
                        >
                          ✓
                        </span>
                        <span className="font-medium">
                          {bookName(ch.bookId, loc)} {ch.chapter}
                        </span>
                        {!done && (
                          <span className="ml-auto text-xs text-gray-400">
                            {t("lectureBibliquePage.reading_mark")}
                          </span>
                        )}
                        {done && (
                          <span className="ml-auto text-xs font-medium text-cecj-green">
                            {t("lectureBibliquePage.reading_completed")}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          )}

          {/* Afternoon */}
          {afternoon.length > 0 && (
            <motion.div variants={fadeUp} className="rounded-2xl border border-cecj-gold/30 bg-amber-50/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <span>🌆</span>
                {t("lectureBibliquePage.reading_afternoon")}
              </h3>
              <ul className="space-y-2">
                {afternoon.map((ch) => {
                  const done = completedSet.has(ch.chapterId)
                  return (
                    <li key={ch.chapterId}>
                      <button
                        onClick={() => reading.markChapterComplete(ch.chapterId)}
                        disabled={done}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                          done
                            ? "bg-cecj-green/10 text-cecj-green"
                            : "bg-white text-gray-800 shadow-sm hover:shadow-md hover:bg-amber-50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                            done
                              ? "border-cecj-green bg-cecj-green text-white"
                              : "border-gray-300 text-transparent",
                          )}
                        >
                          ✓
                        </span>
                        <span className="font-medium">
                          {bookName(ch.bookId, loc)} {ch.chapter}
                        </span>
                        {!done && (
                          <span className="ml-auto text-xs text-gray-400">
                            {t("lectureBibliquePage.reading_mark")}
                          </span>
                        )}
                        {done && (
                          <span className="ml-auto text-xs font-medium text-cecj-green">
                            {t("lectureBibliquePage.reading_completed")}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
