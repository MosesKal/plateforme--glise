import type { Metadata } from "next"
import { LoginForm } from "@/components/features/auth/LoginForm"

export const metadata: Metadata = {
  title: "Connexion — C.E.C.J.",
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return <LoginForm locale={locale} />
}
