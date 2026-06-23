import { api } from "./client"
import { WEEKLY_PROGRAM } from "@/constants/weeklyProgram"

export interface ApiScheduleEntry {
  id: string
  title: string
  days: string[]
  startTime: string
  endTime: string
  category: string
  liveOnYoutube: boolean
  facebookPhotosAfter: boolean
  isRecurring: boolean
  weekStart: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ScheduleResponse {
  source: "recurring" | "weekly"
  entries: ApiScheduleEntry[]
}

export async function fetchSchedule(week?: string): Promise<ScheduleResponse> {
  const { data } = await api.get<ScheduleResponse>("/schedule", {
    params: week ? { week } : undefined,
  })
  return data
}

/** Converts API entries to the shape WeeklyProgramSection expects (same as WEEKLY_PROGRAM constant). */
export function toWeeklyProgram(entries: ApiScheduleEntry[]) {
  return entries.map((e) => ({
    id:                 e.id,
    days:               e.days,
    title:              e.title,
    startTime:          e.startTime,
    endTime:            e.endTime,
    category:           e.category as "Prière" | "Famille" | "Enseignement" | "Adoration",
    liveOnYoutube:      e.liveOnYoutube,
    facebookPhotosAfter: e.facebookPhotosAfter,
  }))
}

export { WEEKLY_PROGRAM as FALLBACK_PROGRAM }
