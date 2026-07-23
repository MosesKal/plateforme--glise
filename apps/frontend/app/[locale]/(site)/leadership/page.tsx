import type { Metadata } from "next"
import { createPublicPageMetadata } from "@/lib/seo"
import { LeadershipContent } from "@/components/features/leadership/LeadershipContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/leadership")
}

export default function LeadershipPage() {
  return <LeadershipContent />
}
