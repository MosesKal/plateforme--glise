import type { Metadata } from "next"
import { SitePageContent } from "@/components/features/site-pages/SitePageContent"

export const metadata: Metadata = {
  title: "Mission",
  description: "La mission de la Communauté des Eglise Camps de Jésus-Christ.",
}

export default function MissionPage() {
  return <SitePageContent slug="mission" />
}
