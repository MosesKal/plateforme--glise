import { api } from "@/lib/api/client"
import type {
  AudioTeaching,
  TeachingTheme,
  VideoTeaching,
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

export interface UploadProgress {
  percent: number
  loadedBytes: number
  totalBytes: number
}

export interface TeachingsStats {
  total: number
  published: number
  draft: number
  archived: number
  totalPlays: number
  totalDurationSec: number
  storageUsedBytes: number
  storageBudgetBytes: number
  topTeachings: AudioTeaching[]
}

export interface AdminVideoTeaching extends VideoTeaching {
  status: TeachingStatus
  isAvailable: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedAdminVideos {
  items: AdminVideoTeaching[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Champs éditoriaux uniquement — les métadonnées YouTube sont pilotées par la sync. */
export interface VideoTeachingPayload {
  status?: TeachingStatus
  themeId?: string | null
  speakerId?: string | null
  position?: number
}

export interface VideoSyncResult {
  created: number
  updated: number
  unavailable: number
  total: number
  syncedAt: string
}

export interface VideoSyncStatus {
  configured: boolean
  lastSync: VideoSyncResult | null
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

  stats: () =>
    api.get<TeachingsStats>("/teachings/audio/stats").then((r) => r.data),

  // Enseignements vidéo (miroir YouTube)
  listVideos: (params?: {
    themeId?: string
    status?: TeachingStatus
    search?: string
    page?: number
    limit?: number
  }) =>
    api
      .get<PaginatedAdminVideos>("/teachings/videos/admin", { params })
      .then((r) => r.data),

  updateVideo: (id: string, payload: VideoTeachingPayload) =>
    api
      .patch<AdminVideoTeaching>(`/teachings/videos/${id}`, payload)
      .then((r) => r.data),

  deleteVideo: (id: string) =>
    api.delete(`/teachings/videos/${id}`).then((r) => r.data),

  /** Lance une sync YouTube complète (timeout désactivé : peut durer > 10 s). */
  syncVideos: () =>
    api
      .post<VideoSyncResult>("/teachings/videos/sync", undefined, { timeout: 0 })
      .then((r) => r.data),

  videoSyncStatus: () =>
    api.get<VideoSyncStatus>("/teachings/videos/sync/status").then((r) => r.data),

  /**
   * Upload du fichier audio. `timeout: 0` désactive le timeout global de 10 s
   * du client — un fichier de 100 Mo sur une connexion lente prend plusieurs
   * minutes, la progression détaillée (%, octets) est remontée via onProgress.
   */
  uploadAudio: (file: File, onProgress?: (progress: UploadProgress) => void) => {
    const form = new FormData()
    form.append("file", file)
    return api
      .post<AudioUploadResult>("/teachings/audio/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0,
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress({
              percent: Math.round((e.loaded / e.total) * 100),
              loadedBytes: e.loaded,
              totalBytes: e.total,
            })
          }
        },
      })
      .then((r) => r.data)
  },
}
