import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vision",
  description: "La vision de la Communauté des Eglise Camps de Jésus-Christ.",
}

export default function VisionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Notre Vision</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
    </div>
  )
}
