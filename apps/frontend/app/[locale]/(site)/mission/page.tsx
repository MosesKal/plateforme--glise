import type { Metadata } from "next"
import { SitePageContent } from "@/components/features/site-pages/SitePageContent"
import { createPublicPageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/mission")
}

export default function MissionPage() {
  return <SitePageContent slug="mission" />
}
