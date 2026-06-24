import type { Metadata } from "next"
import { EnseignementsContent } from "@/components/features/enseignements/EnseignementsContent"

export const metadata: Metadata = {
  title: "Enseignements",
  description: "Sermons, messages et enseignements bibliques de la Communauté des Eglises Camp de Jésus-Christ.",
}

export default function EnseignementsPage() {
  return <EnseignementsContent />
}
