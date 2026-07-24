"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  BIBLE_BOOKS,
  READING_PLANS,
  TOTAL_CHAPTERS,
  buildFlatChapterList,
  chaptersForDay,
  expectedChaptersAfterDays,
  splitMorningAfternoon,
  type ReadingPlanId,
  type ChapterRef,
} from "@/constants/bible"

const STORAGE_KEY = "cecj_bible_state"
const EXTRA_CHAPTER_WINDOW = 5

interface BibleReadingState {
  planId: ReadingPlanId
  startDate: string                        // ISO "YYYY-MM-DD"
  completedChapters: string[]              // ["GEN_1", "GEN_2", ...]
  readingHistory: Record<string, boolean>  // {"2026-06-23": true}
  chapterCompletions: Record<string, string> // {"GEN_1": "2026-06-23"}
  dailyAssignments: Record<string, string[]> // objectif fige par date
}

export interface ColumnProgress {
  columnIndex: number
  books: {
    bookId: string
    nameFr: string
    nameEn: string
    totalChapters: number
    completedChapters: number
    done: boolean
  }[]
  totalChapters: number
  completedChapters: number
  progressPercent: number
}

export interface CalendarDay {
  date: string   // "YYYY-MM-DD"
  status: "completed" | "missed" | "future" | "today"
  readCount: number
  extraCount: number
}

function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function diffDays(from: string, to: string): number {
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  return Math.floor((b - a) / 86_400_000)
}

function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBibleReading() {
  const [state, setState] = useState<BibleReadingState | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as BibleReadingState
        // Discard state with a plan that no longer exists (e.g. legacy "1year")
        if (parsed.planId in READING_PLANS) {
          // Hydratation volontaire depuis une API navigateur indisponible pendant le SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState({
            ...parsed,
            chapterCompletions: parsed.chapterCompletions ?? {},
            dailyAssignments: parsed.dailyAssignments ?? {},
          })
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      // ignore corrupt data
    }
    setHydrated(true)
  }, [])

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state, hydrated])

  // ── Derived flat chapter list (memoised — built once) ──────────────────────
  const flatChapters = useMemo(() => buildFlatChapterList(), [])

  // ── Today's reading ────────────────────────────────────────────────────────
  const todayData = useMemo(() => {
    if (!state) return null

    const today = todayIso()
    const daysSinceStart = Math.max(0, diffDays(state.startDate, today))
    const completedSet = new Set(state.completedChapters)
    // Objectif du jour fige des la premiere validation. Pour un ancien etat,
    // les prochains chapitres non lus sont proposes.
    const todayCount = chaptersForDay(state.planId, daysSinceStart)
    const assignedIds = state.dailyAssignments[today]
    const assigned = assignedIds
      ? assignedIds
          .map((id) => flatChapters.find((chapter) => chapter.chapterId === id))
          .filter((chapter): chapter is ChapterRef => Boolean(chapter))
      : flatChapters.filter((chapter) => !completedSet.has(chapter.chapterId)).slice(0, todayCount)

    const { morning, afternoon } = splitMorningAfternoon(
      assigned,
      state.planId,
      daysSinceStart,
    )

    // L'historique est marqué au moment exact où le dernier chapitre du quota
    // est validé. Il doit donc déverrouiller les lectures supplémentaires sans
    // attendre un rechargement ou un nouveau calcul de l'assignation.
    const allDoneToday = Boolean(state.readingHistory[today]) || (
      assigned.length > 0 && assigned.every((c) => completedSet.has(c.chapterId))
    )
    const assignedSet = new Set(assigned.map((chapter) => chapter.chapterId))
    const extraCompleted = flatChapters.filter(
      (chapter) =>
        state.chapterCompletions[chapter.chapterId] === today &&
        !assignedSet.has(chapter.chapterId),
    )
    const nextExtras = allDoneToday
      ? flatChapters
          .filter((chapter) => !completedSet.has(chapter.chapterId))
          .slice(0, EXTRA_CHAPTER_WINDOW)
      : []
    const activeChapterId =
      assigned.find((chapter) => !completedSet.has(chapter.chapterId))?.chapterId ??
      nextExtras[0]?.chapterId ??
      null

    return {
      chapters: assigned,
      morning,
      afternoon,
      extra: [...extraCompleted, ...nextExtras],
      extraCompletedCount: extraCompleted.length,
      activeChapterId,
      allDoneToday,
      daysSinceStart,
    }
  }, [state, flatChapters])

  // ── Overall progress ───────────────────────────────────────────────────────
  const progress = useMemo(() => {
    const completed = state?.completedChapters.length ?? 0
    return {
      completed,
      total: TOTAL_CHAPTERS,
      percent: Math.round((completed / TOTAL_CHAPTERS) * 100),
    }
  }, [state])

  // ── Retard (catch-up) ──────────────────────────────────────────────────────
  const retard = useMemo(() => {
    if (!state) return null
    const today = todayIso()
    const days = Math.max(0, diffDays(state.startDate, today))
    const expected = expectedChaptersAfterDays(state.planId, days)
    const behind = Math.max(0, expected - (state.completedChapters.length))
    if (behind === 0) return null
    return {
      chapters: behind,
      extraPerDay: Math.ceil(behind / 4), // recover in 4 days
    }
  }, [state])

  // ── Column progress ────────────────────────────────────────────────────────
  const columnProgress = useMemo((): ColumnProgress[] => {
    const completedSet = new Set(state?.completedChapters ?? [])
    return Array.from({ length: 9 }, (_, colIdx) => {
      const books = BIBLE_BOOKS.filter((b) => b.columnIndex === colIdx)
        .sort((a, b) => a.orderInColumn - b.orderInColumn)
        .map((book) => {
          let completedChapters = 0
          for (let ch = 1; ch <= book.chapters; ch++) {
            if (completedSet.has(`${book.id}_${ch}`)) completedChapters++
          }
          return {
            bookId: book.id,
            nameFr: book.nameFr,
            nameEn: book.nameEn,
            totalChapters: book.chapters,
            completedChapters,
            done: completedChapters === book.chapters,
          }
        })
      const totalChapters = books.reduce((s, b) => s + b.totalChapters, 0)
      const completedChapters = books.reduce((s, b) => s + b.completedChapters, 0)
      return {
        columnIndex: colIdx,
        books,
        totalChapters,
        completedChapters,
        progressPercent: Math.round((completedChapters / totalChapters) * 100),
      }
    })
  }, [state])

  // ── Calendar (from plan start through current month) ──────────────────────
  const calendarData = useMemo((): CalendarDay[] => {
    if (!state) return []
    const today = todayIso()
    const now = new Date()
    const start = new Date(`${state.startDate}T00:00:00`)
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const result: CalendarDay[] = []
    while (cursor <= end) {
      const date = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
      const readCount = Object.values(state.chapterCompletions).filter(
        (completedAt) => completedAt === date,
      ).length
      const objectiveCount = state.dailyAssignments[date]?.length ?? 0
      const extraCount = Math.max(0, readCount - objectiveCount)
      const stats = { readCount, extraCount }
      if (date > today) {
        result.push({ date, status: "future", ...stats })
      } else if (date === today) {
        result.push({ date, status: todayData?.allDoneToday ? "completed" : "today", ...stats })
      } else if (date < state.startDate) {
        result.push({ date, status: "future", ...stats }) // before plan started
      } else {
        result.push({ date, status: state.readingHistory[date] ? "completed" : "missed", ...stats })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [state, todayData])

  const readingReport = useMemo(() => {
    const completedDays = calendarData.filter((day) => day.status === "completed").length
    const missedDays = calendarData.filter((day) => day.status === "missed").length
    const trackedDays = completedDays + missedDays
    const consistencyPercent = trackedDays > 0 ? Math.round((completedDays / trackedDays) * 100) : 0
    const totalExtra = calendarData.reduce((sum, day) => sum + day.extraCount, 0)
    const today = todayIso()
    const todayRead = calendarData.find((day) => day.date === today)?.readCount ?? 0
    const todayGoal = todayData?.chapters.length ?? 0

    let currentStreak = 0
    const chronological = calendarData.filter((day) => day.date <= today)
    let index = chronological.length - 1
    if (chronological[index]?.status === "today") index--
    while (index >= 0 && chronological[index].status === "completed") {
      currentStreak++
      index--
    }

    let longestStreak = 0
    let running = 0
    for (const day of chronological) {
      if (day.status === "completed") {
        running++
        longestStreak = Math.max(longestStreak, running)
      } else if (day.status === "missed") {
        running = 0
      }
    }

    return {
      completedDays,
      missedDays,
      consistencyPercent,
      currentStreak,
      longestStreak,
      totalExtra,
      todayRead,
      todayGoal,
    }
  }, [calendarData, todayData])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const selectPlan = useCallback((planId: ReadingPlanId) => {
    setState({
      planId,
      startDate: todayIso(),
      completedChapters: [],
      readingHistory: {},
      chapterCompletions: {},
      dailyAssignments: {},
    })
  }, [])

  const markChapterComplete = useCallback((chapterId: string) => {
    setState((prev) => {
      if (!prev) return prev
      if (prev.completedChapters.includes(chapterId)) return prev
      const today = todayIso()
      const completedSet = new Set(prev.completedChapters)
      const todayCount = chaptersForDay(
        prev.planId,
        Math.max(0, diffDays(prev.startDate, today)),
      )
      const assigned =
        prev.dailyAssignments[today] ??
        flatChapters
          .filter((chapter) => !completedSet.has(chapter.chapterId))
          .slice(0, todayCount)
          .map((chapter) => chapter.chapterId)
      const completedChapters = [...prev.completedChapters, chapterId]
      const updatedSet = new Set(completedChapters)
      const objectiveCompleted = assigned.every((id) => updatedSet.has(id))
      return {
        ...prev,
        completedChapters,
        chapterCompletions: { ...prev.chapterCompletions, [chapterId]: today },
        dailyAssignments: { ...prev.dailyAssignments, [today]: assigned },
        readingHistory: objectiveCompleted
          ? { ...prev.readingHistory, [today]: true }
          : prev.readingHistory,
      }
    })
  }, [flatChapters])

  const markTodayComplete = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        readingHistory: { ...prev.readingHistory, [todayIso()]: true },
      }
    })
  }, [])

  const resetPlan = useCallback(() => {
    setState(null)
  }, [])

  return {
    hydrated,
    state,
    todayData,
    progress,
    retard,
    columnProgress,
    calendarData,
    readingReport,
    dayOfYear,
    selectPlan,
    markChapterComplete,
    markTodayComplete,
    resetPlan,
  }
}
