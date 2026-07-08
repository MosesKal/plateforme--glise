import { create } from "zustand"
import type { AudioTeaching } from "@/lib/api/teachings"

/**
 * État global du player audio.
 *
 * Le store ne contient QUE l'intention de lecture (quelle piste, quelle file,
 * lecture/pause). L'élément <audio> et sa position vivent dans
 * GlobalAudioPlayer — source de vérité du temps réel, jamais dupliquée ici
 * (un timeupdate à 4 Hz dans un store global re-rendrait tout le site).
 */
interface PlayerState {
  track: AudioTeaching | null
  queue: AudioTeaching[]
  isPlaying: boolean
  /** Position de départ (secondes) demandée pour la piste en cours de chargement — lien partagé `?t=`. */
  pendingSeekSec: number | null

  /** Lance une piste, avec la file (ex. les enseignements du thème) pour prev/next. */
  play: (track: AudioTeaching, queue?: AudioTeaching[], startAtSec?: number) => void
  /** Lit puis efface la position de départ demandée (consommée par GlobalAudioPlayer au chargement). */
  consumePendingSeek: () => number | null
  toggle: () => void
  setPlaying: (playing: boolean) => void
  next: () => void
  previous: () => void
  close: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  isPlaying: false,
  pendingSeekSec: null,

  play: (track, queue, startAtSec) =>
    set((state) => ({
      track,
      queue: queue ?? state.queue,
      isPlaying: true,
      pendingSeekSec: startAtSec ?? null,
    })),

  consumePendingSeek: () => {
    const { pendingSeekSec } = get()
    if (pendingSeekSec != null) set({ pendingSeekSec: null })
    return pendingSeekSec
  },

  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  next: () => {
    const { track, queue } = get()
    if (!track) return
    const index = queue.findIndex((t) => t.id === track.id)
    const nextTrack = index >= 0 ? queue[index + 1] : undefined
    if (nextTrack) set({ track: nextTrack, isPlaying: true })
  },

  previous: () => {
    const { track, queue } = get()
    if (!track) return
    const index = queue.findIndex((t) => t.id === track.id)
    const prevTrack = index > 0 ? queue[index - 1] : undefined
    if (prevTrack) set({ track: prevTrack, isPlaying: true })
  },

  close: () =>
    set({ track: null, queue: [], isPlaying: false, pendingSeekSec: null }),
}))
