import { api } from "@/lib/api/client"

// ─── Types publics du module Enseignements (audio) ────────────────────────────

export interface TeachingTheme {
  id: string
  slug: string
  nameFr: string
  nameEn?: string | null
  descriptionFr?: string | null
  coverImage?: string | null
  position: number
  isActive: boolean
  _count: { audioTeachings: number }
}

export interface TeachingTagRef {
  id: string
  slug: string
  name: string
}

export interface AudioTeaching {
  id: string
  slug: string
  title: string
  description?: string | null
  preachedAt?: string | null
  durationSec: number
  fileSize: number
  fileUrl: string | null
  coverImage?: string | null
  playCount: number
  position: number
  theme: { id: string; slug: string; nameFr: string }
  speaker: { id: string; slug: string; fullName: string; title?: string | null }
  tags: TeachingTagRef[]
}

/** Détail public : l'enseignement + ses similaires (même thème ou tags communs). */
export interface AudioTeachingDetail extends AudioTeaching {
  related: AudioTeaching[]
}

export interface PublicTag {
  id: string
  slug: string
  name: string
  count: number
}

export interface PaginatedAudioTeachings {
  items: AudioTeaching[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PublicAudioParams {
  themeSlug?: string
  speakerSlug?: string
  tag?: string
  search?: string
  sort?: "recent" | "popular"
  page?: number
  limit?: number
}

// ─── Endpoints publics ────────────────────────────────────────────────────────

export const teachingsApi = {
  listThemes: () =>
    api.get<TeachingTheme[]>("/teachings/themes").then((r) => r.data),

  getTheme: (slug: string) =>
    api.get<TeachingTheme>(`/teachings/themes/${slug}`).then((r) => r.data),

  listAudio: (params?: PublicAudioParams) =>
    api
      .get<PaginatedAudioTeachings>("/teachings/audio", { params })
      .then((r) => r.data),

  getAudio: (slug: string) =>
    api.get<AudioTeachingDetail>(`/teachings/audio/${slug}`).then((r) => r.data),

  listTags: () =>
    api.get<PublicTag[]>("/teachings/tags").then((r) => r.data),

  /** Beacon d'écoute (déclenché après ~30 s de lecture réelle). */
  registerPlay: (id: string) =>
    api.post(`/teachings/audio/${id}/play`).catch(() => undefined),
}
