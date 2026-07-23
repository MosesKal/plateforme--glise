import type { Metadata } from "next"
import { DepartementsContent } from "@/components/features/departements/DepartementsContent"

export const metadata: Metadata = {
  title: "Départements",
  description: "Découvrez les départements et ministères de l'Église Camp de Jésus-Christ Bel-Air Fizi.",
}

export default function DepartementsPage() {
  return <DepartementsContent />
}
