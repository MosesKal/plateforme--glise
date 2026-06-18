import type { Metadata } from "next"
import { AProposContent } from "@/components/features/apropos/AProposContent"
import { getDictionary } from "@/lib/i18n"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return {
    title: dict.apropos.meta_title,
    description: dict.apropos.meta_desc,
  }
}

export default function AProposPage() {
  return <AProposContent />
}
