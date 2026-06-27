import type { Metadata } from "next"
import { EnseignementsContent } from "@/components/features/enseignements/EnseignementsContent"

export const metadata: Metadata = {
  title: "Enseignements",
  description: "Sermons, messages et enseignements bibliques de l'Église Camp de Jésus Bel-air.",
}

export default function EnseignementsPage() {
  return <EnseignementsContent />
}
