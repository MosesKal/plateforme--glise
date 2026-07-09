import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { EcritsContent } from "@/components/features/teachings/EcritsContent"

export const metadata: Metadata = {
  title: "Enseignements écrits (PDF)",
  description:
    "Notes d'enseignement, études bibliques et supports PDF de l'église, à lire et à télécharger.",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Enseignements écrits (PDF)",
    description:
      "Notes d'enseignement, études bibliques et supports PDF de l'église, à lire et à télécharger.",
  },
}

export default function EnseignementsEcritsPage() {
  return <EcritsContent />
}
