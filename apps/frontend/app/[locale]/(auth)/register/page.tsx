import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inscription",
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-cecj-green">Inscription</h1>
        <p className="mt-1 text-sm text-cecj-ink-faint">
          Créez votre compte
        </p>
      </div>
    </div>
  )
}
