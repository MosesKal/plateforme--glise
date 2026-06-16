import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connexion",
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-cecj-green">Connexion</h1>
        <p className="mt-1 text-sm text-cecj-ink-faint">
          Accédez à votre espace de gestion
        </p>
      </div>
    </div>
  )
}
