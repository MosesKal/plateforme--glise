import { api } from "@/lib/api/client"

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED"

export interface AdminEvent {
  id: string
  titleFr: string
  titleEn: string | null
  descriptionFr: string | null
  category: string | null
  speaker: string | null
  organizer: string | null
  startDate: string
  endDate: string | null
  location: string | null
  address: string | null
  coverImage: string | null
  status: EventStatus
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminEventsResponse {
  items: AdminEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EventPayload {
  titleFr: string
  titleEn?: string
  descriptionFr?: string
  category?: string
  speaker?: string
  organizer?: string
  startDate: string
  endDate?: string
  location?: string
  address?: string
  coverImage?: string
  status?: EventStatus
  isFeatured?: boolean
}

export const adminEventsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<AdminEventsResponse>("/events", {
      params: { limit: 100, status: "all", ...params },
    }),

  create: (payload: EventPayload) =>
    api.post<AdminEvent>("/events", payload),

  update: (id: string, payload: Partial<EventPayload>) =>
    api.patch<AdminEvent>(`/events/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/events/${id}`),
}
