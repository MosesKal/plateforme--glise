"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/providers/I18nProvider"
import { usePlayerStore } from "@/store/player.store"
import { teachingsApi } from "@/lib/api/teachings"
import { formatDuration } from "@/components/features/teachings/format"
import {
  audioTeachingShareUrl,
  openWhatsAppShare,
} from "@/components/features/teachings/share"
import { readSavedPosition, recordRecentPlay } from "@/lib/recent-plays"
import { WhatsAppIcon } from "@/components/ui/icons"

const PLAY_BEACON_AFTER_SEC = 30
// En dessous, le partage n'inclut pas la position : « à partir de 0:04 » n'a pas de sens.
const SHARE_MIN_POSITION_SEC = 10
const SPEEDS = [1, 1.25, 1.5, 2] as const
const SPEED_KEY = "cecj-audio-speed"
const VOLUME_KEY = "cecj-audio-volume"

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
  const { t, locale } = useI18n()
  const {
    source,
    queue,
    isPlaying,
    playbackState,
    toggle,
    setPlaying,
    setPlaybackState,
    next,
    previous,
    close,
    consumePendingSeek,
  } = usePlayerStore()
  const track = source?.type === "teaching" ? source.teaching : null
  const station = source?.type === "live-radio" ? source.station : null
  const isLive = Boolean(station)
  const isActuallyPlaying = playbackState === "playing"
  const sourceKey = track?.id ?? station?.id
  const sourceUrl = track?.fileUrl ?? station?.streamUrl

  const audioRef = useRef<HTMLAudioElement>(null)
  const listenedSecRef = useRef(0)
  const beaconSentRef = useRef(false)
  const lastTimeRef = useRef(0)
  const lastAudibleVolumeRef = useRef(0.8)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(() => {
    if (typeof window === "undefined") return 1
    const saved = Number(window.localStorage.getItem(SPEED_KEY))
    return SPEEDS.includes(saved as (typeof SPEEDS)[number]) ? saved : 1
  })
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0.8
    const saved = Number(window.localStorage.getItem(VOLUME_KEY))
    return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 0.8
  })
  const [audioError, setAudioError] = useState(false)

  // Vitesse persistée (préférence d'écoute, appliquée à chaque piste).
  useEffect(() => {
    const audio = audioRef.current
    if (audio && !isLive) audio.playbackRate = speed
  }, [speed, sourceKey, isLive])

  // Volume commun à la radio et aux enseignements, conservé entre les visites.
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
    if (volume > 0) lastAudibleVolumeRef.current = volume
  }, [volume, sourceKey])

  const cycleSpeed = () => {
    const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length]
    setSpeed(nextSpeed)
    window.localStorage.setItem(SPEED_KEY, String(nextSpeed))
  }

  const changeVolume = (nextVolume: number) => {
    const normalized = Math.min(Math.max(nextVolume, 0), 1)
    setVolume(normalized)
    window.localStorage.setItem(VOLUME_KEY, String(normalized))
  }

  const toggleMute = () => {
    changeVolume(volume > 0 ? 0 : lastAudibleVolumeRef.current || 0.8)
  }

  const trackIndex = track ? queue.findIndex((t) => t.id === track.id) : -1
  const hasPrevious = trackIndex > 0
  const hasNext = trackIndex >= 0 && trackIndex < queue.length - 1

  // ─── Chargement d'une nouvelle piste ────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !source || !sourceUrl) return

    listenedSecRef.current = 0
    beaconSentRef.current = false
    lastTimeRef.current = 0
    setPlaybackState("connecting")

    audio.preload = isLive ? "none" : "metadata"
    audio.src = sourceUrl
    // preload=metadata : seuls les en-têtes sont lus, le flux démarre au play.
    audio.load()

    // Priorité au lien partagé (?t=), sinon reprise de la dernière position.
    if (track) {
      const startAt = consumePendingSeek()
      if (startAt != null && startAt > 0) {
        const target = track.durationSec
          ? Math.min(startAt, Math.max(track.durationSec - 5, 0))
          : startAt
        audio.currentTime = target
      } else {
        const resumeAt = readSavedPosition(track.id)
        if (resumeAt > 10 && (!track.durationSec || resumeAt < track.durationSec - 10)) {
          audio.currentTime = resumeAt
        }
      }
      recordRecentPlay(track)
    }

    audio.play().catch(() => {
      setAudioError(true)
      setPlaying(false)
      setPlaybackState("error")
    })
  }, [
    sourceKey,
    sourceUrl,
    isLive,
    source,
    track,
    consumePendingSeek,
    setPlaying,
    setPlaybackState,
  ])

  // ─── Synchronisation lecture/pause ──────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !source) return
    if (isPlaying) {
      setPlaybackState("connecting")
      audio.play().catch(() => {
        setAudioError(true)
        setPlaying(false)
        setPlaybackState("error")
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, source, setPlaying, setPlaybackState])

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
    if (!source || !("mediaSession" in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track?.title ?? station?.nameFr ?? "",
      artist: track?.speaker.fullName ?? t("radio.live"),
      album: track?.theme.nameFr ?? t("radio.live"),
      artwork: (track?.coverImage ?? station?.coverImage)
        ? [{ src: (track?.coverImage ?? station?.coverImage)!, sizes: "512x512" }]
        : [],
    })
    navigator.mediaSession.setActionHandler("play", () => setPlaying(true))
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false))
    navigator.mediaSession.setActionHandler(
      "previoustrack",
      !isLive && hasPrevious ? previous : null,
    )
    navigator.mediaSession.setActionHandler(
      "nexttrack",
      !isLive && hasNext ? next : null,
    )
    navigator.mediaSession.setActionHandler(
      "seekbackward",
      !isLive ? (details) => seekBy(-(details.seekOffset ?? 10)) : null,
    )
    navigator.mediaSession.setActionHandler(
      "seekforward",
      !isLive ? (details) => seekBy(details.seekOffset ?? 30) : null,
    )
    navigator.mediaSession.setActionHandler(
      "seekto",
      !isLive
        ? (details) => {
            if (details.seekTime != null) seekTo(details.seekTime)
          }
        : null,
    )
  }, [
    source,
    track,
    station,
    isLive,
    hasPrevious,
    hasNext,
    next,
    previous,
    setPlaying,
    seekBy,
    seekTo,
    t,
  ])

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

  // Partage WhatsApp du moment d'écoute : lien ?t= repris par la page de détail.
  const shareMomentOnWhatsApp = useCallback(() => {
    if (!track) return
    const atSec =
      currentTime >= SHARE_MIN_POSITION_SEC ? Math.floor(currentTime) : undefined
    const lines = [
      t("teachings.share.intro"),
      `« ${track.title} » — ${track.speaker.fullName}`,
      ...(atSec ? [`${t("teachings.share.startingAt")} ${formatDuration(atSec)}`] : []),
      audioTeachingShareUrl(locale, track, atSec),
    ]
    openWhatsAppShare(lines.join("\n"))
  }, [track, currentTime, locale, t])

  const handleEnded = useCallback(() => {
    if (track) window.localStorage.removeItem(savedPositionKey(track.id))
    if (hasNext) {
      next()
    } else {
      setPlaying(false)
    }
  }, [track, hasNext, next, setPlaying])

  if (!source) return null

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
        preload={isLive ? "none" : "metadata"}
        onTimeUpdate={isLive ? undefined : handleTimeUpdate}
        onLoadStart={() => {
          setCurrentTime(0)
          setDuration(track?.durationSec || 0)
          setAudioError(false)
        }}
        onLoadedMetadata={(e) => {
          if (track) {
            setDuration(e.currentTarget.duration || track.durationSec || 0)
            updatePositionState()
          }
        }}
        onRateChange={updatePositionState}
        onPlaying={() => {
          setAudioError(false)
          setPlaying(true)
        }}
        onWaiting={() => setPlaybackState("connecting")}
        onPause={() => {
          // audio.load() émet parfois `pause` lors d’un changement de source.
          // Pendant la connexion, cet événement ne doit pas annuler l’intention
          // de lecture de la nouvelle source.
          if (playbackState !== "connecting") setPlaying(false)
        }}
        onEnded={isLive ? undefined : handleEnded}
        onError={() => {
          // Fichier introuvable/corrompu : arrêt propre plutôt qu'un player figé.
          if (audioRef.current?.src) {
            setAudioError(true)
            setPlaying(false)
            setPlaybackState("error")
          }
        }}
      />

      {/* Barre de progression pleine largeur */}
      {!isLive && <input
        type="range"
        min={0}
        max={duration || 1}
        step={1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => seekTo(Number(e.target.value))}
        aria-label={t("teachings.player.seek")}
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
      />}

      {/* En mobile la barre passe sur deux lignes (flex-wrap) : les infos
          occupent toute la 1re ligne, temps + contrôles la 2e — le temps et
          la vitesse restent donc accessibles, là où l'écoute se fait le plus. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:flex-nowrap sm:gap-4 sm:py-2.5 lg:px-8">
        {/* Infos piste + partage du moment */}
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {track?.title ?? station?.nameFr}
            </p>
            <p className="truncate text-xs text-white/60">
              {audioError ? (
                <span className="text-red-300">
                  {isLive ? t("radio.unavailable") : t("teachings.player.fileUnavailable")}
                </span>
              ) : isLive ? (
                <span aria-live="polite">
                  {playbackState === "connecting"
                    ? t("radio.connecting")
                    : playbackState === "playing"
                      ? t("radio.nowPlaying")
                      : t("radio.paused")}
                </span>
              ) : (
                <>{track?.speaker.fullName} · {track?.theme.nameFr}</>
              )}
            </p>
          </div>
          {!isLive && <button
            onClick={shareMomentOnWhatsApp}
            aria-label={t("teachings.share.shareMoment")}
            title={t("teachings.share.shareMoment")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
          </button>}
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={volume === 0 ? t("teachings.player.unmute") : t("teachings.player.mute")}
              title={volume === 0 ? t("teachings.player.unmute") : t("teachings.player.mute")}
              className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {volume === 0 ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Zm5 5 5 5m0-5-5 5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Zm4.5 4.5a3.5 3.5 0 0 1 0 5m2.5-7.5a7 7 0 0 1 0 10" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => changeVolume(Number(event.target.value))}
              aria-label={t("teachings.player.volume")}
              className="h-9 w-14 cursor-pointer appearance-none bg-transparent sm:w-20
                [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/25
                [&::-webkit-slider-thumb]:-mt-1.25 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cecj-gold
                [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/25
                [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cecj-gold"
              style={{
                background: `linear-gradient(to right, var(--color-cecj-gold) ${volume * 100}%, transparent 0)`,
              }}
            />
          </div>
        </div>

        {/* Temps — mr-auto pousse les contrôles à droite sur la ligne mobile */}
        {!isLive && <span className="mr-auto shrink-0 text-[11px] tabular-nums text-white/70 sm:mr-0 sm:text-xs">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>}
        {isLive && (
          <span className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:mr-0">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t("radio.live")}
          </span>
        )}

        {/* Contrôles */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {!isLive && <button
            onClick={cycleSpeed}
            aria-label={`${t("teachings.player.speed")} : ${speed}×`}
            className="flex h-9 min-w-11 items-center justify-center rounded-full border border-white/20 px-2 text-xs font-bold tabular-nums text-white/80 transition hover:bg-white/10"
          >
            {speed}×
          </button>}

          {!isLive && <button
            onClick={previous}
            disabled={!hasPrevious}
            aria-label={t("teachings.player.previous")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>}

          <button
            onClick={toggle}
            aria-label={
              isActuallyPlaying
                ? t("teachings.common.pause")
                : playbackState === "error" && isLive
                  ? t("radio.retry")
                  : t("teachings.player.play")
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cecj-gold text-cecj-green transition hover:scale-105"
          >
            {playbackState === "connecting" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-cecj-green/30 border-t-cecj-green motion-reduce:animate-none" />
            ) : isActuallyPlaying ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {!isLive && <button
            onClick={next}
            disabled={!hasNext}
            aria-label={t("teachings.player.next")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
            </svg>
          </button>}

          <button
            onClick={close}
            aria-label={t("teachings.player.close")}
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
