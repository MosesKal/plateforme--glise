import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { EnseignementsContent } from "@/components/features/teachings/EnseignementsContent"

export const metadata: Metadata = {
  title: "Enseignements",
  description:
    "Écoutez les enseignements audio de l'église, organisés par thèmes : foi, prière, vie chrétienne et plus encore.",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Enseignements",
    description:
      "Écoutez les enseignements audio de l'église, organisés par thèmes : foi, prière, vie chrétienne et plus encore.",
  },
}

export default function EnseignementsPage() {
  return <EnseignementsContent />
}
