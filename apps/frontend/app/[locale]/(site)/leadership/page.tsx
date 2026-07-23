import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { LeadershipContent } from "@/components/features/leadership/LeadershipContent"

export const metadata: Metadata = {
  title: "Leadership | C.E.C.J.C.",
  description: "Découvrez l'équipe de direction de l'Église Camp de Jésus-Christ Bel-Air Fizi — des hommes et des femmes appelés par Dieu pour guider et servir.",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Leadership | C.E.C.J.C.",
    description: "L'équipe de direction de la C.E.C.J.C.",
  },
}

export default function LeadershipPage() {
  return <LeadershipContent />
}
