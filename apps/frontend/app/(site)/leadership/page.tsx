import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leadership",
  description: "Découvrez l'équipe pastorale et le leadership de la C.E.C.J.",
}

export default function LeadershipPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Leadership</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
      <p className="mb-12 text-lg text-gray-600">
        Notre équipe pastorale et de direction est au service de la communauté.
      </p>
      {/* TODO: liste des leaders via backoffice */}
    </div>
  )
}
