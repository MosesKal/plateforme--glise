import type { Metadata } from "next"
import { createPublicPageMetadata } from "@/lib/seo"
import { EnseignementsContent } from "@/components/features/teachings/EnseignementsContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/enseignements")
}

export default function EnseignementsPage() {
  return <EnseignementsContent />
}
