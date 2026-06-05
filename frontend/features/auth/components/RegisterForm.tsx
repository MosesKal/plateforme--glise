"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ROUTES } from "@/constants/routes"

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    try {
      await registerUser(data)
      router.push(ROUTES.dashboard)
    } catch {
      setError("root", { message: "Une erreur est survenue. Veuillez réessayer." })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="firstName"
          label="Prénom"
          placeholder="Jean"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          id="lastName"
          label="Nom"
          placeholder="Dupont"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Créer mon compte
      </Button>
    </form>
  )
}
