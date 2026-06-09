import type { Metadata } from "next"
import { HomePageContent } from "@/components/features/home/HomePageContent"

export const metadata: Metadata = {
  title: "C.E.C.J. — Camp de Jésus Bel-Air",
  description:
    "Bienvenue au Camp de Jésus Bel-Air. Une communauté chrétienne fondée sur la saine doctrine du Seigneur Jésus-Christ, engagée dans la formation des disciples et la transformation des vies.",
}

export default function AccueilPage() {
  return <HomePageContent />
}
