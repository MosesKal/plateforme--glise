"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { fadeUp, stagger, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { SITE_ROUTES } from "@/constants/routes"
import { useAudioTeachings, useVideoTeachings } from "@/hooks/useTeachings"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"
import { LiteYouTubeEmbed } from "@/components/features/teachings/video/LiteYouTubeEmbed"
import { formatDuration } from "@/components/features/teachings/format"
import { formatDate } from "@/lib/utils"

/**
 * Section Enseignements de la page d'accueil : la dernière prédication vidéo
 * (lisible en place) + les derniers audios (lus dans le player global, qui
 * suit l'utilisateur sur tout le site). Se masque si aucun contenu n'existe.
 */
export function TeachingsSection() {
  const { t, locale } = useI18n()

  const { data: audio, isLoading: audioLoading } = useAudioTeachings({ sort: "recent", limit: 3 })
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

        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="aspect-video animate-pulse rounded-2xl bg-cecj-green/10 lg:col-span-3" />
            <div className="space-y-3 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[74px] animate-pulse rounded-xl bg-cecj-green/10" />
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            className={
              latestVideo && audioItems.length > 0
                ? "grid gap-8 lg:grid-cols-5"
                : "mx-auto max-w-3xl"
            }
            variants={stagger}
            {...inView("-40px")}
          >
            {latestVideo && (
              <motion.div variants={fadeUp} className="lg:col-span-3">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cecj-green/60">
                  {t("teachingsSection.latestVideo")}
                </p>
                <article className="overflow-hidden rounded-2xl border border-cecj-rule bg-cecj-panel shadow-sm">
                  <div className="relative aspect-video bg-gray-900">
                    <LiteYouTubeEmbed
                      youtubeId={latestVideo.youtubeId}
                      title={latestVideo.title}
                      thumbnailUrl={latestVideo.thumbnailUrl}
                    />
                    {latestVideo.durationSec > 0 && (
                      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                        {formatDuration(latestVideo.durationSec)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 p-5">
                    <h3 className="line-clamp-2 font-bold leading-snug text-cecj-green">
                      {latestVideo.title}
                    </h3>
                    <p className="text-xs text-cecj-ink-faint">
                      {latestVideo.speaker && <>{latestVideo.speaker.fullName} · </>}
                      {formatDate(latestVideo.publishedAt)}
                    </p>
                    {latestVideo.theme && (
                      <span className="inline-block rounded-full bg-cecj-green/10 px-2.5 py-0.5 text-[11px] font-bold text-cecj-green">
                        {latestVideo.theme.nameFr}
                      </span>
                    )}
                  </div>
                </article>
              </motion.div>
            )}

            {audioItems.length > 0 && (
              <motion.div variants={fadeUp} className="lg:col-span-2">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cecj-green/60">
                  {t("teachingsSection.latestAudio")}
                </p>
                <div className="space-y-3">
                  {audioItems.map((teaching, index) => (
                    <AudioTeachingRow
                      key={teaching.id}
                      teaching={teaching}
                      queue={audioItems}
                      index={index}
                    />
                  ))}
                </div>
                <p className="mt-4 text-xs italic text-cecj-ink-faint">
                  {t("teachingsSection.listenHint")}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div
          variants={fadeUp}
          {...inView()}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href={`/${locale}${SITE_ROUTES.enseignements}`}
            className="inline-block w-full rounded-md bg-cecj-green px-8 py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] sm:w-auto"
          >
            {t("teachingsSection.browseAudio")}
          </Link>
          <Link
            href={`/${locale}${SITE_ROUTES.enseignements}/videos`}
            className="inline-block w-full rounded-md border border-cecj-green px-8 py-3 text-center text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02] sm:w-auto"
          >
            {t("teachingsSection.browseVideos")}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
