import type { Metadata } from "next"
import { EvenementsContent } from "@/components/features/evenements/EvenementsContent"
import { getDictionary } from "@/lib/i18n"
import { createLocalizedMetadata, toSeoLocale } from "@/lib/seo"
import { absoluteUrl } from "@/lib/seo"
import { fetchSeoData, type PaginatedSeoItems, type SeoEvent } from "@/lib/seo-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { CHURCH_INFO } from "@/constants/church"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as "fr" | "en")
  return createLocalizedMetadata({
    locale: toSeoLocale(locale),
    path: "/evenements",
    title: dict.evenementsPage.meta_title,
    description: dict.evenementsPage.meta_desc,
  })
}

export default async function EvenementsPage({ params }: Props) {
  const { locale } = await params
  const events = await fetchSeoData<PaginatedSeoItems<SeoEvent>>("/events?limit=100&status=PUBLISHED")
  const eventSchemas = (events?.items ?? []).map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: locale === "en" && event.titleEn ? event.titleEn : event.titleFr,
    description:
      locale === "en" && event.descriptionEn
        ? event.descriptionEn
        : event.descriptionFr ?? undefined,
    startDate: event.startDate,
    endDate: event.endDate ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.coverImage ? [event.coverImage] : undefined,
    location: {
      "@type": "Place",
      name: event.location ?? CHURCH_INFO.name,
      address: event.address ?? CHURCH_INFO.location.fullAddress,
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer ?? CHURCH_INFO.name,
      url: absoluteUrl(`/${locale}`),
    },
    url: absoluteUrl(`/${locale}/evenements#event-${event.id}`),
  }))

  return (
    <>
      {eventSchemas.length > 0 && <JsonLd data={eventSchemas} />}
      <EvenementsContent />
    </>
  )
}
