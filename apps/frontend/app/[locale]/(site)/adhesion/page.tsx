import type { Metadata } from "next"
import { AdhesionContent } from "@/components/features/adhesion/AdhesionContent"
import { getDictionary } from "@/lib/i18n"
import { createLocalizedMetadata, toSeoLocale } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return createLocalizedMetadata({
    locale: toSeoLocale(locale),
    path: "/adhesion",
    title: dict.adhesion.meta_title,
    description: dict.adhesion.meta_desc,
  })
}

export default function AdhesionPage() {
  return <AdhesionContent />
}
