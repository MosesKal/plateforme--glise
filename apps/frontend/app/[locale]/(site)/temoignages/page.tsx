import type { Metadata } from "next"
import { TemoignagesContent } from "@/components/features/temoignages/TemoignagesContent"

export const metadata: Metadata = {
  title: "Témoignages",
  description: "Découvrez les témoignages de transformation de l'Église Camp de Jésus-Christ Bel-Air Fizi et partagez le vôtre.",
}

export default function TemoignagesPage() {
  return <TemoignagesContent />
}
