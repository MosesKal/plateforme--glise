import type { Metadata } from "next"
import { ExtensionsContent } from "@/components/features/extensions/ExtensionsContent"
import { getDictionary } from "@/lib/i18n"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return {
    title: dict.extensionsPage.meta_title,
    description: dict.extensionsPage.meta_desc,
  }
}

export default function ExtensionsPage() {
  return <ExtensionsContent />
}
