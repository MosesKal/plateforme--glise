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

interface BibleReadingState {
  planId: ReadingPlanId
  startDate: string                        // ISO "YYYY-MM-DD"
  completedChapters: string[]              // ["GEN_1", "GEN_2", ...]
  readingHistory: Record<string, boolean>  // {"2026-06-23": true}
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
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
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
          setState(parsed)
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
    const completedCount = state.completedChapters.length

    // Next N unread chapters from current position
    const todayCount = chaptersForDay(state.planId, daysSinceStart)
    const nextChapters: ChapterRef[] = []
    let i = completedCount
    while (nextChapters.length < todayCount && i < flatChapters.length) {
      if (!completedSet.has(flatChapters[i].chapterId)) {
        nextChapters.push(flatChapters[i])
      }
      i++
    }

    const { morning, afternoon } = splitMorningAfternoon(
      nextChapters,
      state.planId,
      daysSinceStart,
    )

    const allDoneToday =
      nextChapters.length > 0 &&
      nextChapters.every((c) => completedSet.has(c.chapterId))

    return { chapters: nextChapters, morning, afternoon, allDoneToday, daysSinceStart }
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

  // ── Calendar (current month) ───────────────────────────────────────────────
  const calendarData = useMemo((): CalendarDay[] => {
    if (!state) return []
    const today = todayIso()
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result: CalendarDay[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      if (date > today) {
        result.push({ date, status: "future" })
      } else if (date === today) {
        result.push({ date, status: todayData?.allDoneToday ? "completed" : "today" })
      } else if (date < state.startDate) {
        result.push({ date, status: "future" }) // before plan started
      } else {
        result.push({ date, status: state.readingHistory[date] ? "completed" : "missed" })
      }
    }
    return result
  }, [state, todayData])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const selectPlan = useCallback((planId: ReadingPlanId) => {
    setState({
      planId,
      startDate: todayIso(),
      completedChapters: [],
      readingHistory: {},
    })
  }, [])

  const markChapterComplete = useCallback((chapterId: string) => {
    setState((prev) => {
      if (!prev) return prev
      if (prev.completedChapters.includes(chapterId)) return prev
      const completedChapters = [...prev.completedChapters, chapterId]
      // Mark today in history once all today's chapters are done
      return { ...prev, completedChapters }
    })
  }, [])

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
    dayOfYear,
    selectPlan,
    markChapterComplete,
    markTodayComplete,
    resetPlan,
  }
}
