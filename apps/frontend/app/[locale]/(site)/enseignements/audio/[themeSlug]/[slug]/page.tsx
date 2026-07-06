import type { Metadata } from "next"
import { CONFIG } from "@/constants/config"
import { OG_DEFAULTS } from "@/lib/seo"
import { AudioTeachingDetailContent } from "@/components/features/teachings/AudioTeachingDetailContent"

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
  return { title: "Enseignements" }
}

export default async function AudioTeachingDetailPage({ params }: PageProps) {
  const { slug } = await params
  return <AudioTeachingDetailContent slug={slug} />
}
