import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vision",
  description: "La vision de la C.E.C.J. — une église à impact international.",
}

export default function VisionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Notre Vision</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
      <p className="text-lg text-gray-600">
        Nous visons à construire une communauté chrétienne vivante, capable d'accompagner
        la croissance spirituelle de ses membres à l'échelle nationale et internationale,
        à travers plusieurs pays, villes et extensions.
      </p>
      {/* TODO: contenu éditorial via backoffice */}
    </div>
  )
}
