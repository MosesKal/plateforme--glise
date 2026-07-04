import type { Metadata } from "next"
import { GaleriePageContent } from "@/components/features/galerie/GaleriePageContent"

export const metadata: Metadata = {
  title: "Galerie",
  description: "La galerie photos de la C.E.C.J.C.",
}

export default function GaleriePage() {
  return <GaleriePageContent />
}
