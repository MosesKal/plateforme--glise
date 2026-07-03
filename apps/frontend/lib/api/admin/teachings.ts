import { api } from "@/lib/api/client"
import type {
  AudioTeaching,
  TeachingTheme,
} from "@/lib/api/teachings"

// ─── Types backoffice ─────────────────────────────────────────────────────────

export type TeachingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type AudioProcessingStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED"

export interface Speaker {
  id: string
  slug: string
  fullName: string
  title?: string | null
  bio?: string | null
  photoUrl?: string | null
  isActive: boolean
  _count?: { audioTeachings: number }
}

export interface AdminTheme extends TeachingTheme {
  createdAt: string
  updatedAt: string
}

export interface AdminAudioTeaching extends AudioTeaching {
  status: TeachingStatus
  processing: AudioProcessingStatus
  fileKey: string | null
  mimeType: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedAdminAudio {
  items: AdminAudioTeaching[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AudioUploadResult {
  fileKey: string
  fileUrl: string
  fileSize: number
  mimeType: string
  durationSec: number
}

export interface ThemePayload {
  nameFr: string
  nameEn?: string
  descriptionFr?: string
  coverImage?: string
  position?: number
  isActive?: boolean
}

export interface SpeakerPayload {
  fullName: string
  title?: string
  bio?: string
  photoUrl?: string
  isActive?: boolean
}

export interface AudioTeachingPayload {
  title: string
  themeId: string
  speakerId: string
  description?: string
  preachedAt?: string
  coverImage?: string
  tags?: string[]
  status?: TeachingStatus
  fileKey?: string
  fileSize?: number
  mimeType?: string
  durationSec?: number
}

// ─── Endpoints backoffice ─────────────────────────────────────────────────────

export const adminTeachingsApi = {
  // Thèmes
  listThemes: () =>
    api.get<AdminTheme[]>("/teachings/themes/all").then((r) => r.data),
  createTheme: (payload: ThemePayload) =>
    api.post<AdminTheme>("/teachings/themes", payload).then((r) => r.data),
  updateTheme: (id: string, payload: Partial<ThemePayload>) =>
    api.patch<AdminTheme>(`/teachings/themes/${id}`, payload).then((r) => r.data),
  deleteTheme: (id: string) =>
    api.delete(`/teachings/themes/${id}`).then((r) => r.data),

  // Orateurs
  listSpeakers: () =>
    api.get<Speaker[]>("/teachings/speakers/all").then((r) => r.data),
  createSpeaker: (payload: SpeakerPayload) =>
    api.post<Speaker>("/teachings/speakers", payload).then((r) => r.data),
  updateSpeaker: (id: string, payload: Partial<SpeakerPayload>) =>
    api.patch<Speaker>(`/teachings/speakers/${id}`, payload).then((r) => r.data),
  deleteSpeaker: (id: string) =>
    api.delete(`/teachings/speakers/${id}`).then((r) => r.data),

  // Enseignements audio
  listAudio: (params?: {
    themeId?: string
    status?: TeachingStatus
    search?: string
    page?: number
    limit?: number
  }) =>
    api
      .get<PaginatedAdminAudio>("/teachings/audio/admin", { params })
      .then((r) => r.data),

  createAudio: (payload: AudioTeachingPayload) =>
    api.post<AdminAudioTeaching>("/teachings/audio", payload).then((r) => r.data),

  updateAudio: (id: string, payload: Partial<AudioTeachingPayload>) =>
    api
      .patch<AdminAudioTeaching>(`/teachings/audio/${id}`, payload)
      .then((r) => r.data),

  deleteAudio: (id: string) =>
    api.delete(`/teachings/audio/${id}`).then((r) => r.data),

  reorderAudio: (items: { id: string; position: number }[]) =>
    api.patch("/teachings/audio/reorder", { items }).then((r) => r.data),

  /**
   * Upload du fichier audio. `timeout: 0` désactive le timeout global de 10 s
   * du client — un fichier de 100 Mo sur une connexion lente prend plusieurs
   * minutes, la progression est remontée via onProgress (0–100).
   */
  uploadAudio: (file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData()
    form.append("file", file)
    return api
      .post<AudioUploadResult>("/teachings/audio/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0,
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        },
      })
      .then((r) => r.data)
  },
}
