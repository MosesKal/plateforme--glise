import type { Metadata } from "next"
import { SitePageContent } from "@/components/features/site-pages/SitePageContent"

export const metadata: Metadata = {
  title: "Mission",
  description: "La mission de l'Église Camp de Jésus Bel-air.",
}

export default function MissionPage() {
  return <SitePageContent slug="mission" />
}
