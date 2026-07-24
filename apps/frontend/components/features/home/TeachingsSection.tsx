"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { fadeUp, stagger, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { SITE_ROUTES } from "@/constants/routes"
import { useAudioTeachings, useVideoTeachings } from "@/hooks/useTeachings"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"
import { LiteYouTubeEmbed } from "@/components/features/teachings/video/LiteYouTubeEmbed"
import { formatDuration, formatTeachingDate } from "@/components/features/teachings/format"
import { YouTubeLiveSection } from "@/components/features/teachings/video/YouTubeLiveSection"

/**
 * Section Enseignements de la page d'accueil : la dernière prédication vidéo
 * (lisible en place) + les derniers audios (lus dans le player global, qui
 * suit l'utilisateur sur tout le site). Se masque si aucun contenu n'existe.
 */
export function TeachingsSection() {
  const { t, locale } = useI18n()

  const { data: audio, isLoading: audioLoading } = useAudioTeachings({ sort: "recent", limit: 5 })
  const { data: videos, isLoading: videosLoading } = useVideoTeachings({ limit: 1 })

  const audioItems = audio?.items ?? []
  const latestVideo = videos?.items[0]
  const isLoading = audioLoading || videosLoading

  if (!isLoading && audioItems.length === 0 && !latestVideo) return null

  const statParts = [
    audio?.total ? `${audio.total} ${t("teachingsSection.audioCountLabel")}` : null,
    videos?.total ? `${videos.total} ${t("teachingsSection.videoCountLabel")}` : null,
  ].filter(Boolean)

  return (
    <section className="bg-cecj-page px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div className="mb-10 text-center sm:mb-12" variants={stagger} {...inView()}>
          <motion.span
            variants={fadeUp}
            className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green"
          >
            {t("teachingsSection.badge")}
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-cecj-green sm:text-4xl">
            {t("teachingsSection.title")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-cecj-ink-faint">
            {t("teachingsSection.subtitle")}
          </motion.p>
          {statParts.length > 0 && (
            <motion.p
              variants={fadeUp}
              className="mt-3 text-xs font-semibold uppercase tracking-widest text-cecj-green/60"
            >
              {statParts.join(" · ")}
            </motion.p>
          )}
        </motion.div>

        <YouTubeLiveSection />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="animate-pulse space-y-4 lg:col-span-3">
              <div className="h-4 w-48 rounded bg-cecj-green/10" />
              <div className="aspect-video rounded-2xl bg-cecj-green/10" />
            </div>
            <div className="animate-pulse space-y-4 lg:col-span-2">
              <div className="h-4 w-40 rounded bg-cecj-green/10" />
              <div className="h-64 rounded-2xl bg-cecj-green/10 lg:h-[calc(100%-2rem)]" />
            </div>
          </div>
        ) : (
          <motion.div
            className={
              latestVideo && audioItems.length > 0
                ? "grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5 lg:gap-8"
                : "mx-auto max-w-3xl"
            }
            variants={stagger}
            {...inView("-40px")}
          >
            {latestVideo && (
              <motion.div variants={fadeUp} className="flex flex-col lg:col-span-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cecj-green/60 sm:mb-4 sm:text-sm">
                  {t("teachingsSection.latestVideo")}
                </p>
                <article className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-cecj-rule bg-cecj-panel shadow-sm">
                  <div className="relative aspect-video bg-gray-900">
                    <LiteYouTubeEmbed
                      youtubeId={latestVideo.youtubeId}
                      title={latestVideo.title}
                      thumbnailUrl={latestVideo.thumbnailUrl}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                    />
                    {latestVideo.durationSec > 0 && (
                      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                        {formatDuration(latestVideo.durationSec)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5 p-4 sm:p-5">
                    <h3 className="line-clamp-2 font-bold leading-snug text-cecj-green">
                      {latestVideo.title}
                    </h3>
                    <p className="text-xs text-cecj-ink-faint">
                      {latestVideo.speaker && <>{latestVideo.speaker.fullName} · </>}
                      {formatTeachingDate(latestVideo.publishedAt, locale)}
                    </p>
                    {latestVideo.theme && (
                      <span className="inline-block rounded-full bg-cecj-green/10 px-2.5 py-0.5 text-[11px] font-bold text-cecj-green">
                        {latestVideo.theme.nameFr}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/${locale}${SITE_ROUTES.enseignementsVideos}`}
                    className="group flex items-center justify-between border-t border-cecj-rule px-4 py-3 text-sm font-semibold text-cecj-green transition-colors hover:bg-cecj-green/5 sm:px-5"
                  >
                    {t("teachingsSection.browseVideos")}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </article>
              </motion.div>
            )}

            {audioItems.length > 0 && (
              <motion.div variants={fadeUp} className="flex flex-col lg:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cecj-green/60 sm:mb-4 sm:text-sm">
                  {t("teachingsSection.latestAudio")}
                </p>
                <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-cecj-rule bg-cecj-panel shadow-sm">
                  <div className="flex flex-1 flex-col divide-y divide-cecj-rule">
                    {audioItems.map((teaching, index) => (
                      <AudioTeachingRow
                        key={teaching.id}
                        teaching={teaching}
                        queue={audioItems}
                        index={index}
                        variant="flush"
                      />
                    ))}
                  </div>
                  <Link
                    href={`/${locale}${SITE_ROUTES.enseignementsAudios}`}
                    className="group flex items-center justify-between border-t border-cecj-rule px-4 py-3 text-sm font-semibold text-cecj-green transition-colors hover:bg-cecj-green/5 sm:px-5"
                  >
                    {t("teachingsSection.browseAudio")}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {!isLoading && audioItems.length > 0 && (
          <motion.p
            variants={fadeUp}
            {...inView()}
            className="mt-5 text-center text-xs italic text-cecj-ink-faint"
          >
            {t("teachingsSection.listenHint")}
          </motion.p>
        )}
      </div>
    </section>
  )
}
