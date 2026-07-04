"use client"

import type { VideoTeaching } from "@/lib/api/teachings"
import { formatDuration } from "@/components/features/teachings/format"
import { formatDate } from "@/lib/utils"
import { LiteYouTubeEmbed } from "./LiteYouTubeEmbed"

/** Carte vidéo : façade lite-embed 16/9 + métadonnées (la lecture se fait en place). */
export function VideoCard({ video }: { video: VideoTeaching }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-video bg-gray-900">
        <LiteYouTubeEmbed
          youtubeId={video.youtubeId}
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
        />
        {video.durationSec > 0 && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            {formatDuration(video.durationSec)}
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {video.title}
        </h3>
        <p className="text-xs text-gray-400">
          {video.speaker && <>{video.speaker.fullName} · </>}
          {formatDate(video.publishedAt)}
        </p>
        {video.theme && (
          <span className="inline-block rounded-full bg-cecj-green/10 px-2.5 py-0.5 text-[11px] font-bold text-cecj-green">
            {video.theme.nameFr}
          </span>
        )}
      </div>
    </article>
  )
}
