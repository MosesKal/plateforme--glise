import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos et médias de la communauté C.E.C.J.",
}

export default function GaleriePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Galerie</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-gold" />
      {/* TODO: grille de médias via API */}
    </div>
  )
}
