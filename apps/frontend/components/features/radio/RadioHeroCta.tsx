"use client"

import type { PublicRadioStation } from "@cecj/shared"
import { useI18n } from "@/components/providers/I18nProvider"
import { RadioIcon } from "@/components/ui/icons"
import { isLiveRadioPlaying, usePlayerStore } from "@/store/player.store"
import { LiveWaves } from "./LiveWaves"

export function RadioHeroCta({ station }: { station: PublicRadioStation }) {
  const { t } = useI18n()
  const { source, playbackState, playRadio, toggle } = usePlayerStore()
  const isCurrent = source?.type === "live-radio" && source.station.id === station.id
  const isPlaying = isLiveRadioPlaying(source, playbackState, station.id)
  const isConnecting = isCurrent && playbackState === "connecting"

  const handleClick = () => {
    if (isCurrent) toggle()
    else playRadio(station)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isPlaying ? t("radio.pause") : t("radio.listenNow")}
      className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-cecj-gold/60 bg-cecj-gold px-4 py-2.5 text-left text-cecj-green shadow-[0_10px_35px_rgba(255,203,50,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,203,50,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cecj-green motion-reduce:transform-none sm:px-5"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cecj-green text-cecj-gold">
        {isPlaying && (
          <span className="absolute inset-0 animate-ping rounded-full border border-cecj-gold/70 motion-reduce:animate-none" />
        )}
        <RadioIcon className="relative h-5 w-5" />
      </span>
      <span>
        <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
          {t("radio.live")}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-sm font-bold sm:text-base">
          {isConnecting
            ? t("radio.connecting")
            : isPlaying
              ? t("radio.pause")
              : t("radio.listenNow")}
          <LiveWaves active={isPlaying} />
        </span>
      </span>
    </button>
  )
}
