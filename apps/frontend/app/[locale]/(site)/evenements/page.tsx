import type { Metadata } from "next"
import { EvenementsContent } from "@/components/features/evenements/EvenementsContent"
import { getDictionary } from "@/lib/i18n"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return {
    title: dict.evenementsPage.meta_title,
    description: dict.evenementsPage.meta_desc,
  }
}

export default function EvenementsPage() {
  return <EvenementsContent />
}
