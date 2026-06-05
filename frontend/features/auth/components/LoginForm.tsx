"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ADMIN_ROUTES } from "@/constants/routes"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    try {
      await login(data)
      router.push(ADMIN_ROUTES.dashboard)
    } catch {
      setError("root", { message: "Email ou mot de passe incorrect." })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
    >
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="vous@exemple.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="password"
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Se connecter
      </Button>
    </form>
  )
}
