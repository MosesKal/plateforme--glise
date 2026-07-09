"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { useVideoTeachings } from "@/hooks/useTeachings"
import { SITE_ROUTES } from "@/constants/routes"
import { FeaturedTeachingHero } from "@/components/features/teachings/audio/FeaturedTeachingHero"
import { VideoCard } from "@/components/features/teachings/video/VideoCard"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
      <div className="h-1 w-10 rounded bg-cecj-gold" />
    </div>
  )
}

const FORMAT_ICONS = {
  audio: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
  video: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  ecrits: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
} as const

function FormatCard({
  title,
  description,
  href,
  iconPath,
  cta,
  soonLabel,
}: {
  title: string
  description: string
  href: string
  iconPath: string
  cta: string
  soonLabel?: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cecj-green/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cecj-green/8 text-cecj-green transition group-hover:bg-cecj-green group-hover:text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        {soonLabel && (
          <span className="rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-600">
            {soonLabel}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cecj-green">
        {cta}
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  )
}

/** Hub des enseignements : présente les trois formats (audio, vidéo, écrit). */
export function EnseignementsContent() {
  const { t, locale } = useI18n()

  const lp = (path: string) => `/${locale}${path}`

  const { data: videos } = useVideoTeachings({ limit: 3 })

  return (
    <div className="bg-white pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-14 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cecj-gold"
            >
              {t("teachings.hub.badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              {t("teachings.hub.title")}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-base text-white/70 leading-relaxed md:text-lg"
            >
              {t("teachings.hub.intro")}
            </motion.p>

            {/* Dernier enseignement, jouable immédiatement : le visiteur peut
                lancer l'écoute sans traverser thème puis page détail. */}
            <motion.div variants={fadeUp} className="mx-auto max-w-xl pt-3">
              <FeaturedTeachingHero />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Les trois formats */}
      <section className="mx-auto max-w-6xl px-4 pt-14 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
          <motion.div variants={fadeUp}>
            <SectionTitle>{t("teachings.hub.formatsTitle")}</SectionTitle>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div variants={fadeUp}>
              <FormatCard
                title={t("teachings.hub.audioCardTitle")}
                description={t("teachings.hub.audioCardDesc")}
                href={lp(SITE_ROUTES.enseignementsAudios)}
                iconPath={FORMAT_ICONS.audio}
                cta={t("teachings.hub.cardCta")}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <FormatCard
                title={t("teachings.hub.videoCardTitle")}
                description={t("teachings.hub.videoCardDesc")}
                href={lp(SITE_ROUTES.enseignementsVideos)}
                iconPath={FORMAT_ICONS.video}
                cta={t("teachings.hub.cardCta")}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <FormatCard
                title={t("teachings.hub.ecritsCardTitle")}
                description={t("teachings.hub.ecritsCardDesc")}
                href={lp(SITE_ROUTES.enseignementsEcrits)}
                iconPath={FORMAT_ICONS.ecrits}
                cta={t("teachings.hub.cardCta")}
                soonLabel={t("teachings.hub.ecritsCardSoon")}
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Teaser vidéos — visible seulement si la chaîne a été synchronisée */}
      {(videos?.items.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16 lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-6">
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-baseline justify-between gap-2"
            >
              <SectionTitle>{t("teachings.hub.latestVideos")}</SectionTitle>
              <Link
                href={lp(SITE_ROUTES.enseignementsVideos)}
                className="text-sm font-semibold text-cecj-green transition hover:underline"
              >
                {t("teachings.hub.allVideos")}
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos!.items.map((video) => (
                <motion.div key={video.id} variants={fadeUp}>
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
