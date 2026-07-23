import "server-only"
import { CONFIG } from "@/constants/config"

interface ApiEnvelope<T> {
  data: T
}

export interface SeoEvent {
  id: string
  titleFr: string
  titleEn?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  startDate: string
  endDate?: string | null
  location?: string | null
  address?: string | null
  coverImage?: string | null
  organizer?: string | null
  status: string
}

export interface SeoAudio {
  slug: string
  title: string
  description?: string | null
  preachedAt?: string | null
  durationSec: number
  fileUrl?: string | null
  coverImage?: string | null
  createdAt: string
  theme: { slug: string; nameFr: string }
  speaker: { fullName: string }
}

export interface SeoVideo {
  youtubeId: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  durationSec: number
  publishedAt: string
  speaker?: { fullName: string } | null
}

export interface PaginatedSeoItems<T> {
  items: T[]
  totalPages: number
}

export interface SeoTheme {
  slug: string
  nameFr: string
  nameEn?: string | null
  descriptionFr?: string | null
  coverImage?: string | null
}

export async function fetchSeoData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${CONFIG.apiUrl}${path}`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return null
    const envelope = (await response.json()) as ApiEnvelope<T>
    return envelope.data
  } catch {
    return null
  }
}

export function isoDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${seconds || (!hours && !minutes) ? `${seconds}S` : ""}`
}
