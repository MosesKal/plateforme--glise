"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/components/providers/I18nProvider"
import { useAudioTeachings } from "@/hooks/useTeachings"
import { usePlayerStore } from "@/store/player.store"
import { formatDuration } from "@/components/features/teachings/format"

/**
 * Carte « Dernier enseignement » du hero : premier contenu jouable que
 * rencontre le visiteur — la lecture démarre ici, sans passer par une page
 * intermédiaire. Réutilise la requête des derniers enseignements (clé React
 * Query identique à la section « Derniers enseignements » : aucune requête
 * supplémentaire) et met les enseignements récents en file d'attente.
 */
export function FeaturedTeachingHero() {
  const { t, locale } = useI18n()
  const { data, isLoading } = useAudioTeachings({ sort: "recent", limit: 5 })

  const { source, isPlaying, play, toggle } = usePlayerStore()
  const track = source?.type === "teaching" ? source.teaching : null

  // fileUrl peut être null le temps du traitement d'un upload : on ne met
  // jamais en avant (ni en file) un enseignement encore injouable.
  const queue = data?.items.filter((item) => item.fileUrl) ?? []
  const featured = queue[0]

  if (isLoading) {
    return <div className="h-[84px] animate-pulse rounded-2xl bg-white/10 sm:h-[92px]" />
  }

  if (!featured) return null

  const isCurrent = track?.id === featured.id
  const isActive = isCurrent && isPlaying

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur sm:gap-4 sm:p-4">
      {/* Cover */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:h-15 sm:w-15">
        {featured.coverImage ? (
          <Image
            src={featured.coverImage}
            alt=""
            fill
            sizes="60px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cecj-gold/15 text-cecj-gold">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
            </svg>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cecj-gold sm:text-[11px]">
          {t("teachings.hub.featured")}
        </p>
        <Link
          href={`/${locale}/enseignements/audio/${featured.theme.slug}/${featured.slug}`}
          className="mt-0.5 block truncate text-sm font-bold text-white underline-offset-2 hover:underline sm:text-base"
        >
          {featured.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-white/60">
          {featured.speaker.fullName}
          {/* durationSec vaut 0 tant que le traitement n'a pas extrait la
              durée : on masque plutôt qu'afficher « --:-- ». */}
          {featured.durationSec > 0 && <> · {formatDuration(featured.durationSec)}</>}
          {featured.playCount > 0 && (
            <>
              {" · "}
              {featured.playCount}{" "}
              {featured.playCount > 1
                ? t("teachings.detail.playPlural")
                : t("teachings.detail.playSingular")}
            </>
          )}
        </p>
      </div>

      {/* Lecture */}
      <button
        onClick={() => (isCurrent ? toggle() : play(featured, queue))}
        aria-label={`${
          isActive ? t("teachings.player.pauseTrack") : t("teachings.common.listen")
        } ${featured.title}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cecj-gold text-cecj-green shadow-lg transition hover:scale-105"
      >
        {isActive ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  )
}
