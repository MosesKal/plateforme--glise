"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/auth.store"
import type { AdminUser } from "@/lib/api/admin/users"
import type { AdminRole } from "@/lib/api/admin/roles"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const baseSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName:  z.string().min(1, "Le nom est requis"),
  email:     z.string().email("Email invalide").optional().or(z.literal("")),
  password:  z.string().min(8, "Minimum 8 caractères").optional().or(z.literal("")),
  phone:     z.string().optional(),
  roleId:    z.string().min(1, "Le rôle est requis"),
  status:    z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
})

type FormValues = z.infer<typeof baseSchema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export type UserSubmitPayload = {
  firstName: string
  lastName: string
  email?: string
  password?: string
  phone?: string
  roleId: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: UserSubmitPayload) => Promise<void>
  initialData?: AdminUser | null
  roles: AdminRole[]
}

export function UserFormModal({ open, onClose, onSubmit, initialData, roles }: Props) {
  const isEdit = !!initialData
  // Seul le Super Admin peut modifier l'identité de connexion (email, mot de
  // passe) d'un autre utilisateur — l'API rejette ces champs pour les autres rôles.
  const isSuperAdmin = useAuthStore((s) => s.user?.role.name === "Super Admin")
  const showCredentials = !isEdit || isSuperAdmin

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(baseSchema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            firstName: initialData.firstName,
            lastName:  initialData.lastName,
            phone:     initialData.phone ?? "",
            roleId:    initialData.role.id,
            status:    initialData.status,
            email:     initialData.email,
            password:  "",
          }
        : { status: "ACTIVE", email: "", password: "", phone: "" },
    )
  }, [open, initialData, reset])

  const handleFormSubmit = async (values: FormValues) => {
    if (!isEdit) {
      if (!values.email) {
        setError("email", { message: "L'email est requis" })
        return
      }
      if (!values.password) {
        setError("password", { message: "Le mot de passe est requis" })
        return
      }
    }
    await onSubmit({
      firstName: values.firstName,
      lastName:  values.lastName,
      phone:     values.phone || undefined,
      roleId:    values.roleId,
      status:    values.status,
      ...(isEdit
        ? {
            // N'envoyer que ce qui change : l'API réserve ces champs au Super Admin.
            ...(isSuperAdmin && values.email && values.email !== initialData!.email
              ? { email: values.email }
              : {}),
            ...(isSuperAdmin && values.password ? { password: values.password } : {}),
          }
        : { email: values.email!, password: values.password! }),
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-6 py-5">

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" error={errors.firstName?.message}>
              <input {...register("firstName")} className={inputCls} placeholder="Jean" />
            </Field>
            <Field label="Nom *" error={errors.lastName?.message}>
              <input {...register("lastName")} className={inputCls} placeholder="Kalala" />
            </Field>
          </div>

          {showCredentials && (
            <Field label="Email *" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} placeholder="jean@cecj.org" />
            </Field>
          )}

          {showCredentials && (
            <Field
              label={isEdit ? "Nouveau mot de passe" : "Mot de passe *"}
              error={errors.password?.message}
            >
              <input
                {...register("password")}
                type="password"
                className={inputCls}
                placeholder={isEdit ? "Laisser vide pour ne pas changer" : "Minimum 8 caractères"}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone">
              <input {...register("phone")} className={inputCls} placeholder="+243 81 000 0000" />
            </Field>
            <Field label="Rôle *" error={errors.roleId?.message}>
              <select {...register("roleId")} className={inputCls}>
                <option value="">Sélectionner un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Statut" error={errors.status?.message}>
            <select {...register("status")} className={inputCls}>
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
            >
              {isEdit ? "Enregistrer" : "Créer l'utilisateur"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
