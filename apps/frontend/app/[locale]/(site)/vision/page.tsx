import type { Metadata } from "next"
import { SitePageContent } from "@/components/features/site-pages/SitePageContent"

export const metadata: Metadata = {
  title: "Vision",
  description: "La vision de la Communauté des Eglise Camps de Jésus-Christ.",
}

export default function VisionPage() {
  return <SitePageContent slug="vision" />
}
