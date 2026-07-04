"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/player.store"
import { teachingsApi } from "@/lib/api/teachings"
import { formatDuration } from "@/components/features/teachings/format"
import { readSavedPosition, recordRecentPlay } from "@/lib/recent-plays"

const PLAY_BEACON_AFTER_SEC = 30
const SPEEDS = [1, 1.25, 1.5, 2] as const
const SPEED_KEY = "cecj-audio-speed"

function savedPositionKey(trackId: string) {
  return `cecj-audio-pos:${trackId}`
}

/**
 * Player audio global, monté une seule fois dans le layout [locale]
 * (il couvre donc l'accueil et tout le site ; invisible sans piste active).
 *
 * L'élément <audio> est la source de vérité du temps de lecture : le store
 * Zustand ne porte que l'intention (piste, file, lecture/pause), ce composant
 * porte l'état haute fréquence (position) en état local — le reste du site
 * n'est jamais re-rendu par un timeupdate.
 */
export function GlobalAudioPlayer() {
  const { track, queue, isPlaying, toggle, setPlaying, next, previous, close } =
    usePlayerStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const listenedSecRef = useRef(0)
  const beaconSentRef = useRef(false)
  const lastTimeRef = useRef(0)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [audioError, setAudioError] = useState(false)

  // Vitesse persistée (préférence d'écoute, appliquée à chaque piste).
  useEffect(() => {
    const saved = Number(window.localStorage.getItem(SPEED_KEY))
    if (SPEEDS.includes(saved as (typeof SPEEDS)[number])) setSpeed(saved)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.playbackRate = speed
  }, [speed, track?.id])

  const cycleSpeed = () => {
    const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length]
    setSpeed(nextSpeed)
    window.localStorage.setItem(SPEED_KEY, String(nextSpeed))
  }

  const trackIndex = track ? queue.findIndex((t) => t.id === track.id) : -1
  const hasPrevious = trackIndex > 0
  const hasNext = trackIndex >= 0 && trackIndex < queue.length - 1

  // ─── Chargement d'une nouvelle piste ────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track?.fileUrl) return

    listenedSecRef.current = 0
    beaconSentRef.current = false
    lastTimeRef.current = 0
    setCurrentTime(0)
    setDuration(track.durationSec || 0)
    setAudioError(false)

    audio.src = track.fileUrl
    // preload=metadata : seuls les en-têtes sont lus, le flux démarre au play.
    audio.load()

    const resumeAt = readSavedPosition(track.id)
    if (resumeAt > 10 && (!track.durationSec || resumeAt < track.durationSec - 10)) {
      audio.currentTime = resumeAt
      setCurrentTime(resumeAt)
    }

    recordRecentPlay(track)
    audio.play().catch(() => setPlaying(false))
  }, [track?.id, track?.fileUrl, track?.durationSec, setPlaying, track])

  // ─── Synchronisation lecture/pause ──────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    if (isPlaying) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, track, setPlaying])

  // ─── Media Session (contrôles écran verrouillé / casque) ───────────────────

  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.speaker.fullName,
      album: track.theme.nameFr,
      artwork: track.coverImage
        ? [{ src: track.coverImage, sizes: "512x512" }]
        : [],
    })
    navigator.mediaSession.setActionHandler("play", () => setPlaying(true))
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false))
    navigator.mediaSession.setActionHandler("previoustrack", hasPrevious ? previous : null)
    navigator.mediaSession.setActionHandler("nexttrack", hasNext ? next : null)
  }, [track, hasPrevious, hasNext, next, previous, setPlaying])

  // ─── Événements de l'élément audio ──────────────────────────────────────────

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !track) return

    const time = audio.currentTime
    setCurrentTime(time)

    // Temps d'écoute réel (les seeks ne comptent pas) pour le beacon.
    const delta = time - lastTimeRef.current
    if (delta > 0 && delta < 2) listenedSecRef.current += delta
    lastTimeRef.current = time

    if (!beaconSentRef.current && listenedSecRef.current >= PLAY_BEACON_AFTER_SEC) {
      beaconSentRef.current = true
      void teachingsApi.registerPlay(track.id)
    }

    // Sauvegarde de position ~toutes les 5 s (reprise après interruption).
    if (Math.floor(time) % 5 === 0) {
      window.localStorage.setItem(savedPositionKey(track.id), String(Math.floor(time)))
    }
  }, [track])

  const handleEnded = useCallback(() => {
    if (track) window.localStorage.removeItem(savedPositionKey(track.id))
    if (hasNext) {
      next()
    } else {
      setPlaying(false)
    }
  }, [track, hasNext, next, setPlaying])

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
    lastTimeRef.current = value
  }

  if (!track) return null

  return (
    <>
      {/* Spacer en flux : compense la hauteur de la barre fixe pour que le
          bas de page (footer inclus) reste atteignable au scroll. */}
      <div aria-hidden className="h-20" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-cecj-green text-white shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || track.durationSec || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onError={() => {
          // Fichier introuvable/corrompu : arrêt propre plutôt qu'un player figé.
          if (audioRef.current?.src) {
            setAudioError(true)
            setPlaying(false)
          }
        }}
      />

      {/* Barre de progression pleine largeur */}
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => handleSeek(Number(e.target.value))}
        aria-label="Position de lecture"
        className="absolute -top-[7px] left-0 h-3.5 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-white/25
          [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cecj-gold
          [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-white/25
          [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cecj-gold"
        style={{
          background: `linear-gradient(to right, var(--color-cecj-gold) ${
            duration ? (currentTime / duration) * 100 : 0
          }%, transparent 0)`,
        }}
      />

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4 lg:px-8">
        {/* Infos piste */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{track.title}</p>
          <p className="truncate text-xs text-white/60">
            {audioError ? (
              <span className="text-red-300">Fichier audio indisponible</span>
            ) : (
              <>{track.speaker.fullName} · {track.theme.nameFr}</>
            )}
          </p>
        </div>

        {/* Temps */}
        <span className="hidden shrink-0 text-xs tabular-nums text-white/70 sm:block">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Contrôles */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={cycleSpeed}
            aria-label={`Vitesse de lecture : ${speed}×`}
            className="hidden h-8 min-w-11 items-center justify-center rounded-full border border-white/20 px-2 text-xs font-bold tabular-nums text-white/80 transition hover:bg-white/10 sm:flex"
          >
            {speed}×
          </button>

          <button
            onClick={previous}
            disabled={!hasPrevious}
            aria-label="Enseignement précédent"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Lecture"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cecj-gold text-cecj-green transition hover:scale-105"
          >
            {isPlaying ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={next}
            disabled={!hasNext}
            aria-label="Enseignement suivant"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
            </svg>
          </button>

          <button
            onClick={close}
            aria-label="Fermer le lecteur"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </>
  )
}
