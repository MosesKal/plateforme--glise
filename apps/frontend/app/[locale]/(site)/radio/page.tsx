import type { Metadata } from "next"
import { RadioPageContent } from "@/components/features/radio/RadioPageContent"
import { createPublicPageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/radio")
}

export default function RadioPage() {
  return <RadioPageContent />
}
