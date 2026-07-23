import { api } from "./client"
import { type ChurchEvent } from "@/constants/events"
import { normalizeEventCategory } from "@cecj/shared"

// ─── Backend shape ─────────────────────────────────────────────────────────────

export interface ApiEvent {
  id: string
  titleFr: string
  titleEn: string | null
  descriptionFr: string | null
  descriptionEn: string | null
  category: string | null
  speaker: string | null
  organizer: string | null
  startDate: string
  endDate: string | null
  location: string | null
  address: string | null
  coverImage: string | null
  status: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

interface ApiEventsResponse {
  items: ApiEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Date/time helpers ─────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."]
const MONTHS_LONG  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const DAYS_FR      = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"]

function padDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function isMonthLong(start: Date, end: Date): boolean {
  const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
  return start.getDate() === 1 && start.getMonth() === end.getMonth() && end.getDate() === lastDay
}

function buildDateLabel(start: Date, end: Date | null): string {
  if (!end || padDate(start) === padDate(end)) {
    return `${DAYS_FR[start.getDay()]} ${start.getDate()} ${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`
  }
  if (isMonthLong(start, end)) {
    return `${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`
  }
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} & ${end.getDate()} ${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`
  }
  return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`
}

function buildDay(start: Date, end: Date | null): string {
  if (!end || padDate(start) === padDate(end)) return String(start.getDate()).padStart(2, "0")
  if (isMonthLong(start, end)) return MONTHS_LONG[start.getMonth()]
  return `${start.getDate()}-${end.getDate()}`
}

function buildMonth(start: Date, end: Date | null): string {
  if (!end || padDate(start) === padDate(end)) return MONTHS_SHORT[start.getMonth()]
  if (isMonthLong(start, end)) return String(start.getFullYear())
  return MONTHS_SHORT[start.getMonth()]
}

function fmtHm(h: number, m: number): string {
  return `${h}h${String(m).padStart(2, "0")}`
}

function buildTime(start: Date, end: Date | null): string {
  if (end && isMonthLong(start, end)) return "Tout le mois"
  const s = fmtHm(start.getHours(), start.getMinutes())
  if (!end) return s
  const e = fmtHm(end.getHours(), end.getMinutes())
  return s === e ? s : `${s} – ${e}`
}

// ─── Adapter ───────────────────────────────────────────────────────────────────

export function toChurchEvent(event: ApiEvent): ChurchEvent {
  const start = new Date(event.startDate)
  const end   = event.endDate ? new Date(event.endDate) : null

  return {
    id:        event.id,
    title:     event.titleFr,
    category:  normalizeEventCategory(event.category),
    speaker:   event.speaker   ?? undefined,
    organizer: event.organizer ?? undefined,
    dateLabel: buildDateLabel(start, end),
    day:       buildDay(start, end),
    month:     buildMonth(start, end),
    time:      buildTime(start, end),
    location:  event.address ?? event.location ?? "",
    image:     event.coverImage ?? "/event_avenir.jpeg",
    startDate: padDate(start),
    endDate:   padDate(end ?? start),
  }
}

// ─── API call ──────────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<ChurchEvent[]> {
  const { data } = await api.get<ApiEventsResponse>("/events", {
    params: { limit: 100 },
  })
  return data.items.map(toChurchEvent)
}
