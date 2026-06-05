import Link from "next/link"
import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { ROUTES } from "@/constants/routes"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="mt-1 text-sm text-gray-500">
          Rejoignez votre espace de gestion
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link href={ROUTES.login} className="font-medium text-indigo-600 hover:text-indigo-500">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
