import type { Metadata } from "next"
import { CONFIG } from "@/constants/config"
import { localizedAlternates, OG_DEFAULTS, toSeoLocale } from "@/lib/seo"
import { ThemeAudioContent } from "@/components/features/teachings/ThemeAudioContent"

interface PageProps {
  params: Promise<{ locale: string; themeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, themeSlug } = await params
  try {
    const res = await fetch(`${CONFIG.apiUrl}/teachings/themes/${themeSlug}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const { data } = await res.json()
      const description =
        data.descriptionFr ??
        `Les enseignements audio de l'église sur le thème ${data.nameFr}.`
      return {
        title: `${data.nameFr} — Enseignements`,
        description,
        alternates: localizedAlternates(
          toSeoLocale(locale),
          `/enseignements/audio/${themeSlug}`,
        ),
        openGraph: {
          ...OG_DEFAULTS,
          title: `${data.nameFr} — Enseignements`,
          description,
          url: `/${locale}/enseignements/audio/${themeSlug}`,
          ...(data.coverImage && { images: [{ url: data.coverImage }] }),
        },
      }
    }
  } catch {
    // API injoignable au build : métadonnées génériques.
  }
  return {
    title: locale === "en" ? "Bible teachings" : "Enseignements bibliques",
    alternates: localizedAlternates(
      toSeoLocale(locale),
      `/enseignements/audio/${themeSlug}`,
    ),
  }
}

export default async function ThemeAudioPage({ params }: PageProps) {
  const { themeSlug } = await params
  return <ThemeAudioContent themeSlug={themeSlug} />
}
