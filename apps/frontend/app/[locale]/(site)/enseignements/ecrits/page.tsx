import type { Metadata } from "next"
import { createPublicPageMetadata } from "@/lib/seo"
import { EcritsContent } from "@/components/features/teachings/EcritsContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/enseignements/ecrits")
}

export default function EnseignementsEcritsPage() {
  return <EcritsContent />
}
