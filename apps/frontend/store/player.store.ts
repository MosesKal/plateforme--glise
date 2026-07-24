import { create } from "zustand"
import type { PublicRadioStation } from "@cecj/shared"
import type { AudioTeaching } from "@/lib/api/teachings"

export type PlaybackSource =
  | { type: "teaching"; teaching: AudioTeaching }
  | { type: "live-radio"; station: PublicRadioStation }

export type PlaybackState = "idle" | "connecting" | "playing" | "paused" | "error"

export function isLiveRadioPlaying(
  source: PlaybackSource | null,
  playbackState: PlaybackState,
  stationId: string,
): boolean {
  return (
    source?.type === "live-radio" &&
    source.station.id === stationId &&
    playbackState === "playing"
  )
}

/**
 * État global du player audio.
 *
 * Le store ne contient QUE l'intention de lecture (quelle piste, quelle file,
 * lecture/pause). L'élément <audio> et sa position vivent dans
 * GlobalAudioPlayer — source de vérité du temps réel, jamais dupliquée ici
 * (un timeupdate à 4 Hz dans un store global re-rendrait tout le site).
 */
interface PlayerState {
  source: PlaybackSource | null
  queue: AudioTeaching[]
  isPlaying: boolean
  playbackState: PlaybackState
  /** Position de départ (secondes) demandée pour la piste en cours de chargement — lien partagé `?t=`. */
  pendingSeekSec: number | null

  /** Lance une piste, avec la file (ex. les enseignements du thème) pour prev/next. */
  play: (track: AudioTeaching, queue?: AudioTeaching[], startAtSec?: number) => void
  playRadio: (station: PublicRadioStation) => void
  /** Lit puis efface la position de départ demandée (consommée par GlobalAudioPlayer au chargement). */
  consumePendingSeek: () => number | null
  toggle: () => void
  setPlaying: (playing: boolean) => void
  setPlaybackState: (state: PlaybackState) => void
  next: () => void
  previous: () => void
  close: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  source: null,
  queue: [],
  isPlaying: false,
  playbackState: "idle",
  pendingSeekSec: null,

  play: (track, queue, startAtSec) =>
    set((state) => ({
      source: { type: "teaching", teaching: track },
      queue: queue ?? state.queue,
      isPlaying: true,
      playbackState: "connecting",
      pendingSeekSec: startAtSec ?? null,
    })),

  playRadio: (station) =>
    set({
      source: { type: "live-radio", station },
      queue: [],
      isPlaying: true,
      playbackState: "connecting",
      pendingSeekSec: null,
    }),

  consumePendingSeek: () => {
    const { pendingSeekSec } = get()
    if (pendingSeekSec != null) set({ pendingSeekSec: null })
    return pendingSeekSec
  },

  toggle: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
      playbackState: state.isPlaying ? "paused" : "connecting",
    })),

  setPlaying: (playing) =>
    set({
      isPlaying: playing,
      playbackState: playing ? "playing" : "paused",
    }),

  setPlaybackState: (playbackState) => set({ playbackState }),

  next: () => {
    const { source, queue } = get()
    if (source?.type !== "teaching") return
    const track = source.teaching
    const index = queue.findIndex((t) => t.id === track.id)
    const nextTrack = index >= 0 ? queue[index + 1] : undefined
    if (nextTrack) {
      set({
        source: { type: "teaching", teaching: nextTrack },
        isPlaying: true,
        playbackState: "connecting",
      })
    }
  },

  previous: () => {
    const { source, queue } = get()
    if (source?.type !== "teaching") return
    const track = source.teaching
    const index = queue.findIndex((t) => t.id === track.id)
    const prevTrack = index > 0 ? queue[index - 1] : undefined
    if (prevTrack) {
      set({
        source: { type: "teaching", teaching: prevTrack },
        isPlaying: true,
        playbackState: "connecting",
      })
    }
  },

  close: () =>
    set({
      source: null,
      queue: [],
      isPlaying: false,
      playbackState: "idle",
      pendingSeekSec: null,
    }),
}))
