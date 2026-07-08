"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { useAudioTeachingDetail } from "@/hooks/useTeachings"
import { usePlayerStore } from "@/store/player.store"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"
import {
  formatDuration,
  formatFileSize,
  formatTeachingDate,
} from "@/components/features/teachings/format"
import {
  audioTeachingShareUrl,
  openWhatsAppShare,
} from "@/components/features/teachings/share"
import { WhatsAppIcon } from "@/components/ui/icons"

export function AudioTeachingDetailContent({ slug }: { slug: string }) {
  const { t, locale } = useI18n()

  const { data: teaching, isLoading, isError } = useAudioTeachingDetail(slug)
  const { track, isPlaying, play, toggle } = usePlayerStore()
  const [shareFeedback, setShareFeedback] = useState(false)

  const isCurrent = track?.id === teaching?.id
  const isActive = isCurrent && isPlaying

  // Lien partagé « ?t=754 » : on charge la piste à cette position dès l'arrivée.
  // Si le navigateur bloque l'autoplay, le player reste en pause au bon endroit.
  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (!teaching || deepLinkHandled.current) return
    deepLinkHandled.current = true
    const raw = new URLSearchParams(window.location.search).get("t")
    const startAt = raw ? Number(raw) : NaN
    if (Number.isFinite(startAt) && startAt > 0) {
      play(teaching, [teaching, ...teaching.related], Math.floor(startAt))
    }
  }, [teaching, play])

  const handlePlay = () => {
    if (!teaching) return
    if (isCurrent) {
      toggle()
    } else {
      // File d'attente : cet enseignement puis ses similaires.
      play(teaching, [teaching, ...teaching.related])
    }
  }

  const handleWhatsAppShare = () => {
    if (!teaching) return
    const lines = [
      t("teachings.share.intro"),
      `« ${teaching.title} » — ${teaching.speaker.fullName}`,
      audioTeachingShareUrl(locale, teaching),
    ]
    openWhatsAppShare(lines.join("\n"))
  }

  const handleShare = async () => {
    if (!teaching) return
    // URL canonique (sans ?t= éventuel) : on partage l'enseignement, pas un moment.
    const url = audioTeachingShareUrl(locale, teaching)
    try {
      if (navigator.share) {
        await navigator.share({ title: teaching?.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareFeedback(true)
        setTimeout(() => setShareFeedback(false), 2000)
      }
    } catch {
      // Partage annulé par l'utilisateur : rien à faire.
    }
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-gray-500">{t("teachings.detail.notFound")}</p>
        <Link
          href={`/${locale}/enseignements`}
          className="mt-4 inline-block text-sm font-bold text-cecj-green underline underline-offset-4"
        >
          {t("teachings.common.backToTeachings")}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white pb-28">
      {/* En-tête */}
      <section className="relative overflow-hidden bg-cecj-green py-10 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
          {isLoading || !teaching ? (
            <div className="space-y-4">
              <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
              <div className="h-10 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-52 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <motion.div {...inView()} variants={stagger} className="space-y-5">
              <motion.div variants={fadeUp}>
                <Link
                  href={`/${locale}/enseignements/audio/${teaching.theme.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cecj-gold hover:opacity-80"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  {teaching.theme.nameFr}
                </Link>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl"
              >
                {teaching.title}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-sm text-white/60">
                {teaching.speaker.fullName}
                {teaching.speaker.title && ` — ${teaching.speaker.title}`}
                {teaching.preachedAt && (
                  <>
                    {" · "}
                    {formatTeachingDate(teaching.preachedAt, locale)}
                  </>
                )}
                {" · "}{formatDuration(teaching.durationSec)}
                {teaching.playCount > 0 &&
                  ` · ${teaching.playCount} ${
                    teaching.playCount > 1
                      ? t("teachings.detail.playPlural")
                      : t("teachings.detail.playSingular")
                  }`}
              </motion.p>

              {/* Actions */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handlePlay}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cecj-gold px-6 py-3.5 text-sm font-bold text-cecj-green transition hover:scale-[1.02] sm:w-auto sm:py-3"
                >
                  {isActive ? (
                    <>
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                      </svg>
                      {t("teachings.common.pause")}
                    </>
                  ) : (
                    <>
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {isCurrent ? t("teachings.detail.resume") : t("teachings.common.listen")}
                    </>
                  )}
                </button>

                {teaching.fileUrl && (
                  <a
                    href={teaching.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    {t("teachings.detail.download")}
                    <span className="text-xs text-white/50">{formatFileSize(teaching.fileSize)}</span>
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684zm0-9.316a3 3 0 105.368-2.684 3 3 0 00-5.368 2.684z" />
                  </svg>
                  {shareFeedback ? t("teachings.detail.linkCopied") : t("teachings.detail.share")}
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t("teachings.share.whatsapp")}
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Corps */}
      {teaching && (
        <section className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <div className="space-y-12">
            {teaching.description && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">{t("teachings.detail.about")}</h2>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {teaching.description}
                </p>
              </div>
            )}

            {teaching.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {teaching.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-cecj-green/8 px-3 py-1 text-xs font-semibold text-cecj-green"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {teaching.related.length > 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{t("teachings.detail.upNext")}</h2>
                  <div className="h-1 w-10 rounded bg-cecj-gold" />
                </div>
                <div className="space-y-3">
                  {teaching.related.map((related, index) => (
                    <AudioTeachingRow
                      key={related.id}
                      teaching={related}
                      queue={teaching.related}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
