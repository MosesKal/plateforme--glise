import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mission",
  description: "La mission de la C.E.C.J. — évangéliser, former et envoyer.",
}

export default function MissionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Notre Mission</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-gold" />
      <p className="text-lg text-gray-600">
        Notre mission est de partager l'Évangile de Jésus-Christ, former des disciples
        mûrs dans la foi et les envoyer dans le monde pour accomplir la grande mission.
      </p>
      {/* TODO: contenu éditorial via backoffice */}
    </div>
  )
}
