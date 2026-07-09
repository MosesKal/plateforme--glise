import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { AudioTeachingsContent } from "@/components/features/teachings/AudioTeachingsContent"

export const metadata: Metadata = {
  title: "Enseignements audio",
  description:
    "Écoutez les enseignements audio de l'église, organisés par thèmes : foi, prière, vie chrétienne et plus encore.",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Enseignements audio",
    description:
      "Écoutez les enseignements audio de l'église, organisés par thèmes : foi, prière, vie chrétienne et plus encore.",
  },
}

export default function EnseignementsAudioPage() {
  return <AudioTeachingsContent />
}
