import type { Metadata } from "next"
import { GaleriePageContent } from "@/components/features/galerie/GaleriePageContent"
import { createPublicPageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/galerie")
}

export default function GaleriePage() {
  return <GaleriePageContent />
}
