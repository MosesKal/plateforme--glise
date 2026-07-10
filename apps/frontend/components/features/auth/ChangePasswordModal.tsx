"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { authApi } from "@/lib/api/auth"
import { parseApiError } from "@/lib/api/errors"
import { useAuthStore } from "@/store/auth.store"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword:     z.string().min(8, "Minimum 8 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  // À la réouverture, l'état "succès" du passage précédent est effacé — recalé
  // pendant le rendu (pattern « adjusting state during render »), pas en effet.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setSuccess(false)
  }

  useEffect(() => {
    if (open) {
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      // Le backend révoque toutes les sessions et renvoie une nouvelle paire
      // de tokens : on la stocke pour que la session courante continue.
      const { data } = await authApi.changePassword(values.currentPassword, values.newPassword)
      setAuth(data.user, data.accessToken, data.refreshToken)
      setSuccess(true)
    } catch (err: unknown) {
      const apiError = parseApiError(err, "changePassword")
      if (apiError.status === 401) {
        setError("currentPassword", { message: apiError.message })
      } else {
        setError("root", { message: apiError.message })
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Changer mon mot de passe</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="space-y-4 px-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Mot de passe modifié. Vos autres sessions ont été déconnectées.
            </p>
            <Button onClick={onClose} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
            <Field label="Mot de passe actuel *" error={errors.currentPassword?.message}>
              <input {...register("currentPassword")} type="password" autoComplete="current-password" className={inputCls} />
            </Field>

            <Field label="Nouveau mot de passe *" error={errors.newPassword?.message}>
              <input {...register("newPassword")} type="password" autoComplete="new-password" className={inputCls} placeholder="Minimum 8 caractères" />
            </Field>

            <Field label="Confirmer le nouveau mot de passe *" error={errors.confirmPassword?.message}>
              <input {...register("confirmPassword")} type="password" autoComplete="new-password" className={inputCls} />
            </Field>

            {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
              >
                Modifier
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
