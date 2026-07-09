import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { EnseignementsContent } from "@/components/features/teachings/EnseignementsContent"

export const metadata: Metadata = {
  title: "Enseignements",
  description:
    "Retrouvez les enseignements de l'église en audio, en vidéo et bientôt à l'écrit (PDF).",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Enseignements",
    description:
      "Retrouvez les enseignements de l'église en audio, en vidéo et bientôt à l'écrit (PDF).",
  },
}

export default function EnseignementsPage() {
  return <EnseignementsContent />
}
