"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { RadioIcon } from "@/components/ui/icons"
import { SITE_ROUTES } from "@/constants/routes"
import { usePublicRadio } from "@/hooks/useRadio"
import { fadeUp, inView, stagger } from "@/lib/motion"
import { isLiveRadioPlaying, usePlayerStore } from "@/store/player.store"
import { LiveWaves } from "./LiveWaves"

type Benefit = {
  number: string
  title: string
  description: string
}

export function RadioPageContent() {
  const { locale, t } = useI18n()
  const { data: station, isLoading, isError, refetch } = usePublicRadio()
  const { source, playbackState, playRadio, toggle } = usePlayerStore()

  const isCurrent = Boolean(
    station && source?.type === "live-radio" && source.station.id === station.id,
  )
  const isPlaying = Boolean(
    station && isLiveRadioPlaying(source, playbackState, station.id),
  )
  const isConnecting = isCurrent && playbackState === "connecting"
  const hasPlaybackError = isCurrent && playbackState === "error"
  const isUnavailable = isError || (!isLoading && !station) || hasPlaybackError

  const stationName = station
    ? locale === "en" && station.nameEn
      ? station.nameEn
      : station.nameFr
    : "Radio C.E.C.J.C."

  const stationDescription = station
    ? locale === "en"
      ? station.descriptionEn ?? station.descriptionFr
      : station.descriptionFr ?? station.descriptionEn
    : undefined

  const benefits = t("radioPage.benefits") as Benefit[]
  const teachingsHref = `/${locale}${SITE_ROUTES.enseignementsAudios}`

  const handleListen = () => {
    if (!station) {
      void refetch()
      return
    }

    if (isCurrent) toggle()
    else playRadio(station)
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-cecj-green px-4 py-16 text-white sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(255,203,50,0.18),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="absolute -right-20 top-10 -z-10 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-8 top-22 -z-10 h-48 w-48 rounded-full border border-cecj-gold/20" />

        <motion.div
          variants={stagger}
          {...inView()}
          className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <motion.p variants={fadeUp} className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-cecj-gold">
              <span className="h-px w-8 bg-cecj-gold" />
              {t("radioPage.eyebrow")}
            </motion.p>
            <motion.h1 variants={fadeUp} className="max-w-3xl text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              {t("radioPage.title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              {t("radioPage.subtitle")}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-white/65">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                ●&nbsp; {t("radioPage.liveStatus")}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                ↗&nbsp; {t("radioPage.continuous")}
              </span>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-cecj-gold/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black/20">
                {station?.coverImage ? (
                  // URL administrée et dynamique : elle ne peut pas être déclarée dans next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={station.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,203,50,0.22),transparent_66%)]">
                    <RadioIcon className="h-24 w-24 object-contain opacity-90 sm:h-32 sm:w-32" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cecj-green/80 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-lg">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
                  {t("radioPage.onAir")}
                </span>
              </div>

              <div className="pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cecj-gold">
                  {t("radio.live")}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{stationName}</h2>
                <p className="mt-2 min-h-10 text-sm leading-6 text-white/60">
                  {isUnavailable
                    ? t("radioPage.unavailableHint")
                    : stationDescription || t("radio.defaultDescription")}
                </p>

                {isLoading ? (
                  <div className="mt-5 h-13 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
                ) : (
                  <button
                    type="button"
                    onClick={handleListen}
                    disabled={!station && !isUnavailable}
                    className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-cecj-gold px-6 py-3 font-bold text-cecj-green transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
                  >
                    {isConnecting ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-cecj-green/25 border-t-cecj-green motion-reduce:animate-none" />
                    ) : isPlaying ? (
                      <span className="flex h-6 w-6 items-center justify-center gap-1" aria-hidden="true">
                        <span className="h-4 w-1.5 rounded-sm bg-current" />
                        <span className="h-4 w-1.5 rounded-sm bg-current" />
                      </span>
                    ) : (
                      <span className="text-lg" aria-hidden="true">▶</span>
                    )}
                    {isConnecting
                      ? t("radioPage.connecting")
                      : isPlaying
                        ? t("radioPage.pause")
                        : isUnavailable
                          ? t("radioPage.retry")
                          : t("radioPage.listen")}
                    <LiveWaves active={isPlaying} />
                  </button>
                )}

                <p className={`mt-3 text-center text-xs ${isUnavailable ? "text-red-200" : "text-white/45"}`} aria-live="polite">
                  {isUnavailable
                    ? t("radioPage.unavailable")
                    : isPlaying
                      ? t("radio.nowPlaying")
                      : t("radio.paused")}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-cecj-page px-4 py-16 sm:py-20 lg:px-8">
        <motion.div {...inView()} variants={stagger} className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cecj-green">
              {t("radioPage.missionEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-cecj-green sm:text-4xl">
              {t("radioPage.missionTitle")}
            </h2>
            <p className="mt-5 text-base leading-8 text-gray-600">
              {t("radioPage.missionText")}
            </p>
          </motion.div>

          <motion.div variants={stagger} className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <motion.article
                key={benefit.number}
                variants={fadeUp}
                className="group rounded-2xl border border-cecj-green/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none"
              >
                <span className="text-sm font-bold text-cecj-gold">{benefit.number}</span>
                <h3 className="mt-8 text-xl font-bold text-cecj-green">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{benefit.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-white px-4 py-16 sm:py-20 lg:px-8">
        <motion.div
          {...inView()}
          variants={stagger}
          className="mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-3xl bg-cecj-green px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:px-14 lg:py-14"
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cecj-gold">
              {t("radioPage.howEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold">{t("radioPage.howTitle")}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/65">{t("radioPage.howText")}</p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link
              href={teachingsHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cecj-gold px-6 py-3 text-center text-sm font-bold text-cecj-green transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t("radioPage.discoverTeachings")} →
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
