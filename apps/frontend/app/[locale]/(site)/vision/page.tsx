import type { Metadata } from "next"
import { SitePageContent } from "@/components/features/site-pages/SitePageContent"

export const metadata: Metadata = {
  title: "Vision",
  description: "La vision de l'Église Camp de Jésus Bel-air.",
}

export default function VisionPage() {
  return <SitePageContent slug="vision" />
}
