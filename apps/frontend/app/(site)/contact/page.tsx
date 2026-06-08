import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez la Communauté des Eglise Camps de Jésus-Christ.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Nous contacter</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
      <p className="mb-12 text-lg text-gray-600">
        Une question ? Un besoin de prière ? Nous sommes là pour vous.
      </p>
      {/* TODO: formulaire de contact */}
    </div>
  )
}
