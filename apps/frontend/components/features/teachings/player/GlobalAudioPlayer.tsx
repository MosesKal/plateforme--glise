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

  // ─── Seek ───────────────────────────────────────────────────────────────────

  // Position/durée/vitesse communiquées à l'OS : permet la barre de progression
  // et le scrubbing depuis l'écran verrouillé (essentiel en écoute mobile).
  const updatePositionState = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !("mediaSession" in navigator)) return
    if (!("setPositionState" in navigator.mediaSession)) return
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
    navigator.mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate,
      position: Math.min(audio.currentTime, audio.duration),
    })
  }, [])

  const seekTo = useCallback(
    (value: number) => {
      const audio = audioRef.current
      if (!audio) return
      audio.currentTime = value
      setCurrentTime(value)
      lastTimeRef.current = value
      updatePositionState()
    },
    [updatePositionState],
  )

  const seekBy = useCallback(
    (delta: number) => {
      const audio = audioRef.current
      if (!audio) return
      const max = Number.isFinite(audio.duration) ? audio.duration : Infinity
      seekTo(Math.min(Math.max(audio.currentTime + delta, 0), max))
    },
    [seekTo],
  )

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
    navigator.mediaSession.setActionHandler("seekbackward", (details) =>
      seekBy(-(details.seekOffset ?? 10)),
    )
    navigator.mediaSession.setActionHandler("seekforward", (details) =>
      seekBy(details.seekOffset ?? 30),
    )
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) seekTo(details.seekTime)
    })
  }, [track, hasPrevious, hasNext, next, previous, setPlaying, seekBy, seekTo])

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

  if (!track) return null

  return (
    <>
      {/* Spacer en flux : compense la hauteur de la barre fixe (2 lignes en
          mobile + zone sûre iOS) pour que le bas de page reste atteignable. */}
      <div
        aria-hidden
        className="h-[calc(6.5rem+env(safe-area-inset-bottom))] sm:h-[calc(5rem+env(safe-area-inset-bottom))]"
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-cecj-green pb-[env(safe-area-inset-bottom)] text-white shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || track.durationSec || 0)
          updatePositionState()
        }}
        onRateChange={updatePositionState}
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
        onChange={(e) => seekTo(Number(e.target.value))}
        aria-label="Position de lecture"
        className="absolute -top-2.5 left-0 h-5 w-full cursor-pointer touch-none appearance-none bg-transparent sm:-top-1.75 sm:h-3.5
          [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-white/25
          [&::-webkit-slider-thumb]:-mt-1.25 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cecj-gold
          [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-white/25
          [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cecj-gold"
        style={{
          background: `linear-gradient(to right, var(--color-cecj-gold) ${
            duration ? (currentTime / duration) * 100 : 0
          }%, transparent 0)`,
        }}
      />

      {/* En mobile la barre passe sur deux lignes (flex-wrap) : les infos
          occupent toute la 1re ligne, temps + contrôles la 2e — le temps et
          la vitesse restent donc accessibles, là où l'écoute se fait le plus. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:flex-nowrap sm:gap-4 sm:py-2.5 lg:px-8">
        {/* Infos piste */}
        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <p className="truncate text-sm font-semibold">{track.title}</p>
          <p className="truncate text-xs text-white/60">
            {audioError ? (
              <span className="text-red-300">Fichier audio indisponible</span>
            ) : (
              <>{track.speaker.fullName} · {track.theme.nameFr}</>
            )}
          </p>
        </div>

        {/* Temps — mr-auto pousse les contrôles à droite sur la ligne mobile */}
        <span className="mr-auto shrink-0 text-[11px] tabular-nums text-white/70 sm:mr-0 sm:text-xs">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Contrôles */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            onClick={cycleSpeed}
            aria-label={`Vitesse de lecture : ${speed}×`}
            className="flex h-9 min-w-11 items-center justify-center rounded-full border border-white/20 px-2 text-xs font-bold tabular-nums text-white/80 transition hover:bg-white/10"
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
