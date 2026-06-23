"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { COLUMN_LABELS } from "@/constants/bible"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface ColonnesProgressProps {
  reading: ReadingHook
}

export function ColonnesProgress({ reading }: ColonnesProgressProps) {
  const { t, locale } = useI18n()
  const loc = locale as "fr" | "en"

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div variants={stagger} {...inView()} className="space-y-10">
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-cecj-gold/20 px-4 py-1.5 text-sm font-semibold text-amber-700">
              {t("lectureBibliquePage.columns_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.columns_title")}
            </h2>
          </motion.div>

          {/* Columns grid */}
          <motion.div
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          >
            {reading.columnProgress.map((col) => {
              const isDone = col.progressPercent === 100
              const hasStarted = col.completedChapters > 0

              return (
                <motion.div
                  key={col.columnIndex}
                  variants={fadeUp}
                  className={cn(
                    "rounded-2xl border p-5 transition-shadow hover:shadow-md",
                    isDone
                      ? "border-cecj-green/30 bg-cecj-green/5"
                      : hasStarted
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-gray-100 bg-gray-50",
                  )}
                >
                  {/* Column header */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">
                      {COLUMN_LABELS[col.columnIndex][loc]}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">
                        {col.completedChapters}/{col.totalChapters}
                      </span>
                      {isDone && (
                        <span className="rounded-full bg-cecj-green px-2 py-0.5 text-xs font-bold text-white">
                          {t("lectureBibliquePage.columns_done")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${col.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        isDone ? "bg-cecj-green" : "bg-amber-400",
                      )}
                    />
                  </div>

                  {/* Book list */}
                  <ul className="space-y-1.5">
                    {col.books.map((book) => (
                      <li
                        key={book.bookId}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                          book.done ? "text-cecj-green" : "text-gray-600",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs",
                            book.done
                              ? "bg-cecj-green text-white"
                              : book.completedChapters > 0
                              ? "bg-amber-400 text-white"
                              : "border border-gray-300 bg-white",
                          )}
                        >
                          {book.done ? "✓" : book.completedChapters > 0 ? "~" : ""}
                        </span>
                        <span className={cn("flex-1 font-medium", book.done && "line-through opacity-60")}>
                          {loc === "fr" ? book.nameFr : book.nameEn}
                        </span>
                        {book.completedChapters > 0 && !book.done && (
                          <span className="text-xs text-amber-600">
                            {book.completedChapters}/{book.totalChapters}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
