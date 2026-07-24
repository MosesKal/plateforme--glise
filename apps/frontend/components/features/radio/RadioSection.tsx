"use client"

import type { PublicRadioStation } from "@cecj/shared"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { RadioIcon } from "@/components/ui/icons"
import { fadeUp, inView, stagger } from "@/lib/motion"
import { isLiveRadioPlaying, usePlayerStore } from "@/store/player.store"
import { LiveWaves } from "./LiveWaves"

export function RadioSection({ station }: { station: PublicRadioStation }) {
  const { t, locale } = useI18n()
  const { source, playbackState, playRadio, toggle } = usePlayerStore()
  const isCurrent = source?.type === "live-radio" && source.station.id === station.id
  const isPlaying = isLiveRadioPlaying(source, playbackState, station.id)
  const isConnecting = isCurrent && playbackState === "connecting"
  const hasError = isCurrent && playbackState === "error"
  const name = locale === "en" && station.nameEn ? station.nameEn : station.nameFr
  const description =
    locale === "en"
      ? station.descriptionEn ?? station.descriptionFr
      : station.descriptionFr ?? station.descriptionEn

  const handleClick = () => {
    if (isCurrent) toggle()
    else playRadio(station)
  }

  const status = hasError
    ? t("radio.unavailable")
    : isConnecting
      ? t("radio.connecting")
      : isPlaying
        ? t("radio.nowPlaying")
        : t("radio.paused")

  return (
    <section className="overflow-hidden bg-cecj-page px-4 py-7 sm:py-10">
      <motion.div
        variants={stagger}
        {...inView()}
        className="relative mx-auto grid max-w-4xl overflow-hidden rounded-2xl bg-cecj-green shadow-lg md:grid-cols-[0.75fr_1.25fr]"
      >
        <motion.div variants={fadeUp} className="relative min-h-40 bg-white/5 md:min-h-[18rem]">
          {station.coverImage ? (
            // Domaine dynamique administré : l’optimiseur Next ne peut pas être préconfiguré.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={station.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,203,50,0.24),transparent_65%)]">
              <RadioIcon className="h-16 w-16 text-cecj-gold/80 sm:h-20 sm:w-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cecj-green/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-cecj-green/50" />
        </motion.div>

        <motion.div variants={fadeUp} className="relative flex flex-col justify-center p-4 text-white sm:p-6 lg:p-7">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-400/40 bg-red-600/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-200">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {t("radio.live")}
          </span>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">{name}</h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/70 sm:text-sm">
            {description || t("radio.defaultDescription")}
          </p>

          <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleClick}
              aria-label={isPlaying ? t("radio.pause") : hasError ? t("radio.retry") : t("radio.listenNow")}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cecj-gold px-4 py-2 text-sm font-bold text-cecj-green transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transform-none"
            >
              {isConnecting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-cecj-green/30 border-t-cecj-green motion-reduce:animate-none" />
              ) : isPlaying ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {isPlaying ? t("radio.pause") : hasError ? t("radio.retry") : t("radio.listenNow")}
              <LiveWaves active={isPlaying} />
            </button>

            <p
              aria-live="polite"
              className={hasError ? "text-sm text-red-300" : "text-sm text-white/60"}
            >
              {status}
            </p>
          </div>

          {station.websiteUrl && (
            <a
              href={station.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-fit text-xs font-semibold text-cecj-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cecj-gold"
            >
              {t("radio.officialWebsite")} ↗
            </a>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
