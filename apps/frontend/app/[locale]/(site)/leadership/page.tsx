import type { Metadata } from "next"
import { LeadershipContent } from "@/components/features/leadership/LeadershipContent"

export const metadata: Metadata = {
  title: "Leadership | C.E.C.J.",
  description: "Découvrez l'équipe de direction de l'Église Camp de Jésus Bel-air — des hommes et des femmes appelés par Dieu pour guider et servir.",
  openGraph: {
    title: "Leadership | C.E.C.J.",
    description: "L'équipe de direction de la C.E.C.J.",
  },
}

export default function LeadershipPage() {
  return <LeadershipContent />
}
