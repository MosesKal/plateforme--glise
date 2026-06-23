import { api } from "@/lib/api/client"

export interface AdminScheduleEntry {
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

export interface ScheduleEntryPayload {
  title: string
  days: string[]
  startTime: string
  endTime: string
  category: string
  liveOnYoutube?: boolean
  facebookPhotosAfter?: boolean
  isRecurring?: boolean
  weekStart?: string
  sortOrder?: number
  isActive?: boolean
}

export const adminScheduleApi = {
  list: () =>
    api.get<AdminScheduleEntry[]>("/schedule/entries"),

  create: (payload: ScheduleEntryPayload) =>
    api.post<AdminScheduleEntry>("/schedule", payload),

  update: (id: string, payload: Partial<ScheduleEntryPayload>) =>
    api.patch<AdminScheduleEntry>(`/schedule/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/schedule/${id}`),
}
