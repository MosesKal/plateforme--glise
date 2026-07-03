import type { Metadata } from "next"
import { CONFIG } from "@/constants/config"
import { ThemeAudioContent } from "@/components/features/teachings/ThemeAudioContent"

interface PageProps {
  params: Promise<{ themeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { themeSlug } = await params
  try {
    const res = await fetch(`${CONFIG.apiUrl}/teachings/themes/${themeSlug}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const { data } = await res.json()
      return {
        title: `${data.nameFr} — Enseignements`,
        description:
          data.descriptionFr ??
          `Les enseignements audio de la C.E.C.J. sur le thème ${data.nameFr}.`,
      }
    }
  } catch {
    // API injoignable au build : métadonnées génériques.
  }
  return { title: "Enseignements" }
}

export default async function ThemeAudioPage({ params }: PageProps) {
  const { themeSlug } = await params
  return <ThemeAudioContent themeSlug={themeSlug} />
}
