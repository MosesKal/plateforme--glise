import type { Metadata } from "next"
import { createPublicPageMetadata } from "@/lib/seo"
import { absoluteUrl } from "@/lib/seo"
import { fetchSeoData, isoDuration, type PaginatedSeoItems, type SeoVideo } from "@/lib/seo-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { VideosContent } from "@/components/features/teachings/video/VideosContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/enseignements/videos")
}

export default async function EnseignementsVideosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const videos = await fetchSeoData<PaginatedSeoItems<SeoVideo>>("/teachings/videos?limit=100")
  const schemas = (videos?.items ?? []).map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: [video.thumbnailUrl ?? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`],
    uploadDate: video.publishedAt,
    duration: isoDuration(video.durationSec),
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    url: `${absoluteUrl(`/${locale}/enseignements/videos`)}#video-${video.youtubeId}`,
    ...(video.speaker && { creator: { "@type": "Person", name: video.speaker.fullName } }),
  }))

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <VideosContent />
    </>
  )
}
