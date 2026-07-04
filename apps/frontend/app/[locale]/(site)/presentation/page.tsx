import type { Metadata } from "next"
import { SitePageContent } from "@/components/features/site-pages/SitePageContent"

export const metadata: Metadata = {
  title: "Présentation",
  description: "Découvrez l'histoire et l'identité de la C.E.C.J.C.",
}

export default function PresentationPage() {
  return <SitePageContent slug="presentation" />
}
