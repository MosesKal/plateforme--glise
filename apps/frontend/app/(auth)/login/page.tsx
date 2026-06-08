import Link from "next/link"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { ROUTES } from "@/constants/routes"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Accédez à votre espace de gestion
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link href={ROUTES.register} className="font-medium text-indigo-600 hover:text-indigo-500">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
