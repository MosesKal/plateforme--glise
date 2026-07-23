import type { Metadata } from "next"
import { HomePageContent } from "@/components/features/home/HomePageContent"
import {
  BRAND_SEARCH_VARIANTS,
  createLocalizedMetadata,
  type SeoLocale,
} from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale: SeoLocale = rawLocale === "en" ? "en" : "fr"

  const metadata = createLocalizedMetadata({
    locale,
    path: "/",
    title:
      locale === "fr"
        ? "Église Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi"
        : "Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi",
    description:
      locale === "fr"
        ? "Site officiel de l'Église Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi : enseignements bibliques, événements, programme, extensions et vie de l'église."
        : "Official website of Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi: Bible teachings, events, weekly program, extensions and church life.",
  })

  return {
    ...metadata,
    keywords: [
      ...BRAND_SEARCH_VARIANTS,
      "église à Lubumbashi",
      "église Bel-Air Lubumbashi",
      "église Fizi Lubumbashi",
      "enseignements bibliques Lubumbashi",
    ],
  }
}

export default function AccueilPage() {
  return <HomePageContent />
}
