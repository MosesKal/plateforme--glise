import type { Metadata } from "next"
import { TemoignagesContent } from "@/components/features/temoignages/TemoignagesContent"
import { createPublicPageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/temoignages")
}

export default function TemoignagesPage() {
  return <TemoignagesContent />
}
