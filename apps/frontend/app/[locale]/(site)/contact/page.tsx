import type { Metadata } from "next"
import { createPublicPageMetadata } from "@/lib/seo"
import { ContactContent } from "@/components/features/contact/ContactContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/contact")
}

export default function ContactPage() {
  return <ContactContent />
}
