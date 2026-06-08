import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Événements",
  description: "Agenda des événements et rencontres de la C.E.C.J.",
}

export default function EvenementsPublicPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Événements</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
      <p className="mb-12 text-lg text-gray-600">
        Retrouvez tous les prochains événements et rencontres de notre communauté.
      </p>
      {/* TODO: liste des événements via API */}
    </div>
  )
}
