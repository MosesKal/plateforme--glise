import type { Metadata } from "next"
import { EnseignementsContent } from "@/components/features/teachings/EnseignementsContent"

export const metadata: Metadata = {
  title: "Enseignements",
  description:
    "Écoutez les enseignements audio de l'église, organisés par thèmes : foi, prière, vie chrétienne et plus encore.",
}

export default function EnseignementsPage() {
  return <EnseignementsContent />
}
