import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Événements",
  description: "Les événements à venir de la C.E.C.J.",
}

export default function EvenementsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Événements</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
    </div>
  )
}
