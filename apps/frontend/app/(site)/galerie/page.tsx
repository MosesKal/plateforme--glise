import type { Metadata } from "next"
import { GaleriePageContent } from "@/components/features/galerie/GaleriePageContent"

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos et médias de la communauté C.E.C.J.",
}

export default function GaleriePage() {
  return <GaleriePageContent />
}
