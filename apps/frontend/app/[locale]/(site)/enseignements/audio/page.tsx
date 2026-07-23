import type { Metadata } from "next"
import { createPublicPageMetadata } from "@/lib/seo"
import { AudioTeachingsContent } from "@/components/features/teachings/AudioTeachingsContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return createPublicPageMetadata((await params).locale, "/enseignements/audio")
}

export default function EnseignementsAudioPage() {
  return <AudioTeachingsContent />
}
