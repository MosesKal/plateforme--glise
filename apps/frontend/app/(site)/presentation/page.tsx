import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Présentation",
  description: "Découvrez l'histoire et l'identité de la C.E.C.J.",
}

export default function PresentationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Présentation</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-gold" />
      <p className="text-lg text-gray-600">
        La Communauté des Eglise Camps de Jésus-Christ (C.E.C.J.) est une église évangélique
        fondée sur la Parole de Dieu, ancrée dans la foi chrétienne et tournée vers l'évangélisation mondiale.
      </p>
      {/* TODO: contenu éditorial via backoffice */}
    </div>
  )
}
