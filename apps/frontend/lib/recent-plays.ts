import type { AudioTeaching } from "@/lib/api/teachings"

/**
 * Historique d'écoute local (localStorage) alimenté par le player global.
 *
 * On stocke un instantané minimal de la piste (pas l'objet complet) : assez
 * pour afficher « Reprendre l'écoute » et construire le lien vers la page de
 * l'enseignement — les données fraîches sont refetchées à la navigation.
 */
export interface RecentPlay {
  id: string
  slug: string
  title: string
  themeSlug: string
  themeName: string
  speakerName: string
  durationSec: number
  playedAt: number
}

const RECENT_KEY = "cecj-recent-plays"
const POSITION_KEY_PREFIX = "cecj-audio-pos:"
const MAX_ENTRIES = 12

export function readRecentPlays(): RecentPlay[] {
  if (typeof window === "undefined") return []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]")
    return Array.isArray(parsed) ? (parsed as RecentPlay[]) : []
  } catch {
    return []
  }
}

export function recordRecentPlay(track: AudioTeaching): void {
  if (typeof window === "undefined") return
  const entry: RecentPlay = {
    id: track.id,
    slug: track.slug,
    title: track.title,
    themeSlug: track.theme.slug,
    themeName: track.theme.nameFr,
    speakerName: track.speaker.fullName,
    durationSec: track.durationSec,
    playedAt: Date.now(),
  }
  const rest = readRecentPlays().filter((p) => p.id !== track.id)
  window.localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([entry, ...rest].slice(0, MAX_ENTRIES)),
  )
}

/** Position sauvegardée (secondes) pour un enseignement, 0 si aucune. */
export function readSavedPosition(trackId: string): number {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(`${POSITION_KEY_PREFIX}${trackId}`)
  const value = raw ? Number(raw) : 0
  return Number.isFinite(value) && value > 0 ? value : 0
}
