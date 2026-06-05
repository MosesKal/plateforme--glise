import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Extensions",
  description: "Trouvez une extension C.E.C.J. près de chez vous.",
}

export default function ExtensionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Nos Extensions</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-gold" />
      <p className="mb-12 text-lg text-gray-600">
        La C.E.C.J. est présente dans plusieurs pays et villes. Trouvez une communauté près de chez vous.
      </p>
      {/* TODO: carte interactive + liste des extensions via API */}
    </div>
  )
}
