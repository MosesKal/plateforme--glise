"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminTeachingsApi,
  type AudioTeachingPayload,
  type SpeakerPayload,
  type TeachingStatus,
  type ThemePayload,
  type VideoTeachingPayload,
} from "@/lib/api/admin/teachings"

const THEMES_KEY = ["admin", "teachings", "themes"] as const
const SPEAKERS_KEY = ["admin", "teachings", "speakers"] as const
const AUDIO_KEY = ["admin", "teachings", "audio"] as const
const VIDEOS_KEY = ["admin", "teachings", "videos"] as const

// ─── Thèmes ───────────────────────────────────────────────────────────────────

export function useAdminThemes() {
  return useQuery({ queryKey: THEMES_KEY, queryFn: adminTeachingsApi.listThemes })
}

export function useCreateTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ThemePayload) => adminTeachingsApi.createTheme(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: THEMES_KEY }),
  })
}

export function useUpdateTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ThemePayload> }) =>
      adminTeachingsApi.updateTheme(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: THEMES_KEY }),
  })
}

export function useDeleteTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminTeachingsApi.deleteTheme(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: THEMES_KEY }),
  })
}

// ─── Orateurs ─────────────────────────────────────────────────────────────────

export function useAdminSpeakers() {
  return useQuery({ queryKey: SPEAKERS_KEY, queryFn: adminTeachingsApi.listSpeakers })
}

export function useCreateSpeaker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SpeakerPayload) => adminTeachingsApi.createSpeaker(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SPEAKERS_KEY }),
  })
}

export function useUpdateSpeaker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SpeakerPayload> }) =>
      adminTeachingsApi.updateSpeaker(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SPEAKERS_KEY }),
  })
}

export function useDeleteSpeaker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminTeachingsApi.deleteSpeaker(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SPEAKERS_KEY }),
  })
}

// ─── Enseignements audio ──────────────────────────────────────────────────────

export function useAdminAudioTeachings(params?: {
  themeId?: string
  status?: TeachingStatus
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: [...AUDIO_KEY, params],
    queryFn: () => adminTeachingsApi.listAudio(params),
    // Changement de page/filtre : la page précédente reste affichée pendant le
    // chargement (pas de flash de liste vide).
    placeholderData: keepPreviousData,
    // Tant qu'un transcodage est en cours côté serveur, on rafraîchit la liste
    // pour voir les fichiers passer en READY sans recharger la page.
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (t) => t.fileKey && (t.processing === "PENDING" || t.processing === "PROCESSING"),
      )
        ? 5000
        : false,
  })
}

export function useCreateAudioTeaching() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AudioTeachingPayload) =>
      adminTeachingsApi.createAudio(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AUDIO_KEY })
      qc.invalidateQueries({ queryKey: THEMES_KEY }) // compteurs par thème
    },
  })
}

export function useUpdateAudioTeaching() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AudioTeachingPayload> }) =>
      adminTeachingsApi.updateAudio(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AUDIO_KEY })
      qc.invalidateQueries({ queryKey: THEMES_KEY })
    },
  })
}

export function useDeleteAudioTeaching() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminTeachingsApi.deleteAudio(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AUDIO_KEY })
      qc.invalidateQueries({ queryKey: THEMES_KEY })
    },
  })
}

export function useTeachingsStats() {
  return useQuery({
    queryKey: [...AUDIO_KEY, "stats"],
    queryFn: adminTeachingsApi.stats,
  })
}

// ─── Enseignements vidéo (miroir YouTube) ─────────────────────────────────────

export function useAdminVideoTeachings(params?: {
  themeId?: string
  status?: TeachingStatus
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: [...VIDEOS_KEY, params],
    queryFn: () => adminTeachingsApi.listVideos(params),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateVideoTeaching() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VideoTeachingPayload }) =>
      adminTeachingsApi.updateVideo(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: VIDEOS_KEY }),
  })
}

export function useDeleteVideoTeaching() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminTeachingsApi.deleteVideo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VIDEOS_KEY }),
  })
}

export function useSyncVideos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => adminTeachingsApi.syncVideos(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VIDEOS_KEY })
      qc.invalidateQueries({ queryKey: [...VIDEOS_KEY, "sync-status"] })
    },
  })
}

export function useVideoSyncStatus() {
  return useQuery({
    queryKey: [...VIDEOS_KEY, "sync-status"],
    queryFn: adminTeachingsApi.videoSyncStatus,
  })
}

export function useReorderAudioTeachings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; position: number }[]) =>
      adminTeachingsApi.reorderAudio(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUDIO_KEY }),
  })
}
