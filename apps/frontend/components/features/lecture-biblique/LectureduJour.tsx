"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { bookName, type ChapterRef } from "@/constants/bible"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, inView } from "@/lib/motion"
import type { useBibleReading } from "@/hooks/useBibleReading"

type ReadingHook = ReturnType<typeof useBibleReading>

interface LectureduJourProps {
  reading: ReadingHook
}

function ChapterCheckbox({
  chapter,
  done,
  active,
  locale,
  onComplete,
}: {
  chapter: ChapterRef
  done: boolean
  active: boolean
  locale: "fr" | "en"
  onComplete: () => void
}) {
  const { t } = useI18n()
  const disabled = done || !active

  return (
    <label
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        done && "border-cecj-green/15 bg-cecj-green/10 text-cecj-green",
        active && !done && "cursor-pointer border-cecj-green/30 bg-white text-gray-800 shadow-sm hover:border-cecj-green hover:shadow-md",
        !active && !done && "cursor-not-allowed border-gray-100 bg-gray-100/70 text-gray-400",
      )}
    >
      <input
        type="checkbox"
        checked={done}
        disabled={disabled}
        onChange={() => onComplete()}
        className="h-5 w-5 shrink-0 accent-cecj-green disabled:cursor-not-allowed"
      />
      <span className="font-medium">
        {bookName(chapter.bookId, locale)} {chapter.chapter}
      </span>
      <span className="ml-auto text-xs font-medium">
        {done
          ? t("lectureBibliquePage.reading_completed")
          : active
            ? t("lectureBibliquePage.reading_mark")
            : t("lectureBibliquePage.reading_locked")}
      </span>
    </label>
  )
}

function ChapterGroup({
  title,
  icon,
  chapters,
  reading,
  locale,
  tone = "morning",
}: {
  title: string
  icon: string
  chapters: ChapterRef[]
  reading: ReadingHook
  locale: "fr" | "en"
  tone?: "morning" | "afternoon" | "extra"
}) {
  const completedSet = new Set(reading.state?.completedChapters ?? [])
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        tone === "morning" && "border-gray-100 bg-gray-50",
        tone === "afternoon" && "border-cecj-gold/30 bg-amber-50/50",
        tone === "extra" && "border-blue-200 bg-blue-50/60",
      )}
    >
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {chapters.map((chapter) => (
          <li key={chapter.chapterId}>
            <ChapterCheckbox
              chapter={chapter}
              done={completedSet.has(chapter.chapterId)}
              active={reading.todayData?.activeChapterId === chapter.chapterId}
              locale={locale}
              onComplete={() => reading.markChapterComplete(chapter.chapterId)}
            />
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export function LectureduJour({ reading }: LectureduJourProps) {
  const { t, locale } = useI18n()
  const loc = locale as "fr" | "en"
  const todayData = reading.todayData
  if (!todayData) return null

  const { morning, afternoon, extra, extraCompletedCount, allDoneToday } = todayData

  if (todayData.chapters.length === 0 && extra.length === 0) {
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
          <motion.div variants={fadeUp} className="text-center">
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-4 py-1.5 text-sm font-semibold text-cecj-green">
              {t("lectureBibliquePage.reading_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("lectureBibliquePage.reading_title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("lectureBibliquePage.day_number").replace("{n}", String(todayData.daysSinceStart + 1))}
              {" · "}
              {todayData.chapters.length} {t("lectureBibliquePage.plan_chapters")}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-gray-500">
              {t("lectureBibliquePage.reading_sequence_help")}
            </p>
          </motion.div>

          {allDoneToday && (
            <motion.div variants={fadeUp} className="rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-center">
              <span className="text-2xl">✅</span>
              <p className="mt-1 font-semibold text-green-700">
                {t("lectureBibliquePage.reading_done_all")}
              </p>
              {extraCompletedCount > 0 && (
                <p className="mt-1 text-sm text-green-700/75">
                  +{extraCompletedCount} {t("lectureBibliquePage.reading_extra_count")}
                </p>
              )}
            </motion.div>
          )}

          {morning.length > 0 && (
            <ChapterGroup title={t("lectureBibliquePage.reading_morning")} icon="🌅" chapters={morning} reading={reading} locale={loc} />
          )}
          {afternoon.length > 0 && (
            <ChapterGroup title={t("lectureBibliquePage.reading_afternoon")} icon="🌆" chapters={afternoon} reading={reading} locale={loc} tone="afternoon" />
          )}
          {extra.length > 0 && allDoneToday && (
            <>
              <motion.div variants={fadeUp} className="text-center">
                <h3 className="font-bold text-cecj-green">{t("lectureBibliquePage.reading_extra_title")}</h3>
                <p className="mt-1 text-sm text-gray-500">{t("lectureBibliquePage.reading_extra_desc")}</p>
              </motion.div>
              <ChapterGroup title={t("lectureBibliquePage.reading_extra_title")} icon="📚" chapters={extra} reading={reading} locale={loc} tone="extra" />
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
