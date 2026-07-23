import type { Metadata } from "next"
import { CONFIG } from "@/constants/config"
import { OG_DEFAULTS } from "@/lib/seo"
import { AudioTeachingDetailContent } from "@/components/features/teachings/AudioTeachingDetailContent"
import { JsonLd } from "@/components/seo/JsonLd"
import { absoluteUrl, localizedAlternates, toSeoLocale } from "@/lib/seo"
import { fetchSeoData, isoDuration, type SeoAudio } from "@/lib/seo-data"

interface PageProps {
  params: Promise<{ locale: string; themeSlug: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, themeSlug, slug } = await params
  try {
    const res = await fetch(`${CONFIG.apiUrl}/teachings/audio/${slug}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const { data } = await res.json()
      const description =
        data.description ??
        `Enseignement de ${data.speaker.fullName} sur le thème ${data.theme.nameFr}.`
      return {
        title: `${data.title} — Enseignements`,
        description,
        alternates: localizedAlternates(
          toSeoLocale(locale),
          `/enseignements/audio/${themeSlug}/${slug}`,
        ),
        openGraph: {
          ...OG_DEFAULTS,
          type: "article",
          title: data.title,
          description,
          url: `/${locale}/enseignements/audio/${themeSlug}/${slug}`,
          ...(data.coverImage && { images: [{ url: data.coverImage }] }),
        },
      }
    }
  } catch {
    // API injoignable au build : métadonnées génériques.
  }
  return {
    title: locale === "en" ? "Bible teaching" : "Enseignement biblique",
    alternates: localizedAlternates(
      toSeoLocale(locale),
      `/enseignements/audio/${themeSlug}/${slug}`,
    ),
  }
}

export default async function AudioTeachingDetailPage({ params }: PageProps) {
  const { locale, themeSlug, slug } = await params
  const teaching = await fetchSeoData<SeoAudio>(`/teachings/audio/${slug}`)
  const schema = teaching
    ? {
        "@context": "https://schema.org",
        "@type": "AudioObject",
        name: teaching.title,
        description: teaching.description ?? teaching.title,
        contentUrl: teaching.fileUrl ?? undefined,
        duration: isoDuration(teaching.durationSec),
        uploadDate: teaching.createdAt,
        datePublished: teaching.preachedAt ?? teaching.createdAt,
        thumbnailUrl: teaching.coverImage ?? absoluteUrl("/og"),
        url: absoluteUrl(`/${locale}/enseignements/audio/${themeSlug}/${slug}`),
        creator: { "@type": "Person", name: teaching.speaker.fullName },
        publisher: { "@id": `${absoluteUrl("/")}#church` },
      }
    : null

  return (
    <>
      {schema && <JsonLd data={schema} />}
      <AudioTeachingDetailContent slug={slug} />
    </>
  )
}
