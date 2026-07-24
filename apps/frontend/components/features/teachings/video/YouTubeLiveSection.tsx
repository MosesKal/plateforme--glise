"use client"

import { useI18n } from "@/components/providers/I18nProvider"
import { useCurrentYouTubeLive } from "@/hooks/useTeachings"

export function YouTubeLiveSection() {
  const { t } = useI18n()
  const { data: live } = useCurrentYouTubeLive()

  if (!live) return null

  return (
    <a
      href={`https://www.youtube.com/watch?v=${live.youtubeId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-2.5 transition hover:border-red-300 hover:bg-red-100 sm:mx-auto sm:mb-8 sm:max-w-3xl"
    >
      {live.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={live.thumbnailUrl}
          alt=""
          className="h-14 w-20 shrink-0 rounded-lg object-cover sm:h-16 sm:w-28"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600 motion-reduce:animate-none" />
          {t("youtubeLive.liveNow")}
        </span>
        <span className="mt-1 block truncate text-sm font-bold text-cecj-green sm:text-base">
          {live.title}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-red-600 px-3 py-2 text-xs font-bold text-white transition group-hover:bg-red-500 sm:px-4">
        {t("youtubeLive.watch")}
      </span>
    </a>
  )
}
