import type { Metadata } from "next"
import { LectureBibliqueContent } from "@/components/features/lecture-biblique/LectureBibliqueContent"
import { getDictionary } from "@/lib/i18n"
import { createLocalizedMetadata, toSeoLocale } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return createLocalizedMetadata({
    locale: toSeoLocale(locale),
    path: "/lecture-biblique",
    title: dict.lectureBibliquePage.meta_title,
    description: dict.lectureBibliquePage.meta_desc,
  })
}

export default function LectureBibliquePage() {
  return <LectureBibliqueContent />
}
