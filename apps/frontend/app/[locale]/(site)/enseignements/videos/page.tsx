import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { VideosContent } from "@/components/features/teachings/video/VideosContent"

export const metadata: Metadata = {
  title: "Enseignements vidéo",
  description:
    "Regardez les prédications et enseignements vidéo de l'église, synchronisés depuis notre chaîne YouTube.",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Enseignements vidéo",
    description:
      "Regardez les prédications et enseignements vidéo de l'église, synchronisés depuis notre chaîne YouTube.",
  },
}

export default function EnseignementsVideosPage() {
  return <VideosContent />
}
