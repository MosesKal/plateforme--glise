"use client"

import { useQuery } from "@tanstack/react-query"
import {
  teachingsApi,
  type PublicAudioParams,
  type PublicVideoParams,
} from "@/lib/api/teachings"

const STALE_TIME = 5 * 60 * 1000 // contenu éditorial : 5 min de fraîcheur suffisent

export function useTeachingThemes() {
  return useQuery({
    queryKey: ["teachings", "themes"],
    queryFn: () => teachingsApi.listThemes(),
    staleTime: STALE_TIME,
  })
}

export function useTeachingTheme(slug: string) {
  return useQuery({
    queryKey: ["teachings", "themes", slug],
    queryFn: () => teachingsApi.getTheme(slug),
    staleTime: STALE_TIME,
    enabled: Boolean(slug),
  })
}

export function useAudioTeachings(params?: PublicAudioParams, enabled = true) {
  return useQuery({
    queryKey: ["teachings", "audio", params],
    queryFn: () => teachingsApi.listAudio(params),
    staleTime: STALE_TIME,
    enabled,
  })
}

export function useAudioTeachingDetail(slug: string) {
  return useQuery({
    queryKey: ["teachings", "audio", "detail", slug],
    queryFn: () => teachingsApi.getAudio(slug),
    staleTime: STALE_TIME,
    enabled: Boolean(slug),
  })
}

export function useVideoTeachings(params?: PublicVideoParams, enabled = true) {
  return useQuery({
    queryKey: ["teachings", "videos", params],
    queryFn: () => teachingsApi.listVideos(params),
    staleTime: STALE_TIME,
    enabled,
  })
}

export function useTeachingTags() {
  return useQuery({
    queryKey: ["teachings", "tags"],
    queryFn: () => teachingsApi.listTags(),
    staleTime: STALE_TIME,
  })
}
