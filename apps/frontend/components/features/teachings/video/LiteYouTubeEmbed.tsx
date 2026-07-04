"use client"

import { useState } from "react"

interface Props {
  youtubeId: string
  title: string
  /** Vignette YouTube déjà connue (sinon dérivée de l'ID). */
  thumbnailUrl?: string | null
}

/**
 * Façade « lite embed » : tant que l'utilisateur n'a pas cliqué, seule la
 * vignette (une simple image) est affichée — l'iframe YouTube (~1 Mo de JS
 * tiers) n'est chargée qu'au clic, avec autoplay pour que le clic lance
 * directement la lecture. Domaine youtube-nocookie : pas de cookies de
 * tracking avant interaction.
 */
export function LiteYouTubeEmbed({ youtubeId, title, thumbnailUrl }: Props) {
  const [activated, setActivated] = useState(false)

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    )
  }

  return (
    <button
      onClick={() => setActivated(true)}
      aria-label={`Lire la vidéo : ${title}`}
      className="group absolute inset-0 h-full w-full cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
      {/* Bouton play */}
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cecj-green/90 text-white shadow-lg transition group-hover:scale-110 group-hover:bg-cecj-red">
        <svg className="ml-1 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  )
}
