"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePlayerStore } from "@/store/player.store"
import { formatDuration } from "@/components/features/teachings/format"
import type { AudioTeaching } from "@/lib/api/teachings"

/**
 * Ligne d'enseignement audio : lance la lecture dans le player global avec la
 * liste courante comme file d'attente (enchaînement automatique du thème).
 *
 * `variant="flush"` : sans bordure ni fond propre, pour vivre dans un panneau
 * parent à séparateurs (ex : section Enseignements de l'accueil).
 */
export function AudioTeachingRow({
  teaching,
  queue,
  index,
  variant = "card",
}: {
  teaching: AudioTeaching
  queue: AudioTeaching[]
  index: number
  variant?: "card" | "flush"
}) {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "fr"
  const detailHref = `/${locale}/enseignements/audio/${teaching.theme.slug}/${teaching.slug}`

  const { track, isPlaying, play, toggle } = usePlayerStore()
  const isCurrent = track?.id === teaching.id
  const isActive = isCurrent && isPlaying

  const handleClick = () => {
    if (isCurrent) {
      toggle()
    } else {
      play(teaching, queue)
    }
  }

  const containerClasses =
    variant === "flush"
      ? `flex-1 px-4 sm:px-5 ${isCurrent ? "bg-cecj-green/5" : "hover:bg-cecj-green/[0.04]"}`
      : `rounded-xl border px-4 sm:px-5 ${
          isCurrent
            ? "border-cecj-green/30 bg-cecj-green/5"
            : "border-gray-100 bg-white hover:border-cecj-green/20 hover:bg-gray-50/60"
        }`

  return (
    <div
      className={`group flex items-center gap-3 py-3.5 transition-colors sm:gap-4 ${containerClasses}`}
    >
      {/* Bouton lecture */}
      <button
        onClick={handleClick}
        aria-label={isActive ? `Mettre en pause ${teaching.title}` : `Écouter ${teaching.title}`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
          isCurrent
            ? "bg-cecj-green text-white"
            : "bg-cecj-green/10 text-cecj-green group-hover:bg-cecj-green group-hover:text-white"
        }`}
      >
        {isActive ? (
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg className="ml-0.5 h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Numéro + infos */}
      <span
        className={`hidden w-6 shrink-0 text-center text-sm tabular-nums sm:block ${
          variant === "flush" ? "text-cecj-ink-dim/60" : "text-gray-300"
        }`}
      >
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <Link
          href={detailHref}
          className={`block truncate text-sm font-semibold hover:underline underline-offset-2 ${
            isCurrent
              ? "text-cecj-green"
              : variant === "flush"
                ? "text-cecj-ink"
                : "text-gray-900"
          }`}
        >
          {teaching.title}
        </Link>
        <p
          className={`mt-0.5 truncate text-xs ${
            variant === "flush" ? "text-cecj-ink-dim" : "text-gray-400"
          }`}
        >
          {teaching.speaker.fullName}
          {teaching.preachedAt && (
            <>
              {" · "}
              {new Date(teaching.preachedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </>
          )}
        </p>
      </div>

      {/* Durée */}
      <span
        className={`shrink-0 text-xs tabular-nums ${
          variant === "flush" ? "text-cecj-ink-dim" : "text-gray-400"
        }`}
      >
        {formatDuration(teaching.durationSec)}
      </span>
    </div>
  )
}
