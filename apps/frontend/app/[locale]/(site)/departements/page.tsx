import type { Metadata } from "next"
import { DepartementsContent } from "@/components/features/departements/DepartementsContent"
import { createPublicPageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/departements")
}

export default function DepartementsPage() {
  return <DepartementsContent />
}
