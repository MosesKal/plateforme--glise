import type { Metadata } from "next"
import { OrganisationContent } from "@/components/features/organisation/OrganisationContent"
import { getDictionary } from "@/lib/i18n"
import { createLocalizedMetadata, toSeoLocale } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return createLocalizedMetadata({
    locale: toSeoLocale(locale),
    path: "/organisation",
    title: dict.organisation.meta_title,
    description: dict.organisation.meta_desc,
  })
}

export default function OrganisationPage() {
  return <OrganisationContent />
}
