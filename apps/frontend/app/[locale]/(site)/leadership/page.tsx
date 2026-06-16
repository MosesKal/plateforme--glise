import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leadership",
  description: "L'équipe de direction de la C.E.C.J.",
}

export default function LeadershipPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">Leadership</h1>
      <div className="mb-8 h-1 w-16 rounded bg-cecj-green/40" />
    </div>
  )
}
