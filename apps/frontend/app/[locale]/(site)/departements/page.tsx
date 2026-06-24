import type { Metadata } from "next"
import { DepartementsContent } from "@/components/features/departements/DepartementsContent"

export const metadata: Metadata = {
  title: "Départements",
  description: "Découvrez les départements et ministères de la Communauté des Eglises Camp de Jésus-Christ.",
}

export default function DepartementsPage() {
  return <DepartementsContent />
}
