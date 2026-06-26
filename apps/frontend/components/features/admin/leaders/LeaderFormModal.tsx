"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/ImageUpload"
import type { Leader } from "@/lib/api/admin/leaders"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const ROLES = [
  { value: "FOUNDER",       label: "Fondateur"           },
  { value: "SENIOR_PASTOR", label: "Pasteur Principal"   },
  { value: "PASTOR",        label: "Pasteur"             },
  { value: "ELDER",         label: "Ancien"              },
  { value: "DEACON",        label: "Diacre"              },
  { value: "WORSHIP_LEADER",label: "Responsable Louange" },
  { value: "YOUTH_LEADER",  label: "Responsable Jeunesse"},
  { value: "OTHER",         label: "Autre"               },
]

const schema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName:  z.string().min(1, "Le nom est requis"),
  title:     z.string().optional(),
  role:      z.string().optional(),
  bio:       z.string().optional(),
  photoUrl:  z.string().optional(),
  email:     z.string().email("Email invalide").optional().or(z.literal("")),
  phone:     z.string().optional(),
  order:     z.number().int().min(0).optional(),
  isActive:  z.boolean(),
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
  onSubmit: (values: FormValues) => Promise<void>
  initialData?: Leader | null
}

export function LeaderFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            firstName: initialData.firstName,
            lastName:  initialData.lastName,
            title:     initialData.title     ?? "",
            role:      initialData.role      ?? "OTHER",
            bio:       initialData.bio       ?? "",
            photoUrl:  initialData.photoUrl  ?? "",
            email:     initialData.email     ?? "",
            phone:     initialData.phone     ?? "",
            order:     initialData.order,
            isActive:  initialData.isActive,
          }
        : { role: "OTHER", isActive: true, order: 0 },
    )
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier le leader" : "Ajouter un leader"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" error={errors.firstName?.message}>
              <input {...register("firstName")} className={inputCls} placeholder="Jean" />
            </Field>
            <Field label="Nom *" error={errors.lastName?.message}>
              <input {...register("lastName")} className={inputCls} placeholder="Dupont" />
            </Field>
          </div>

          <Field label="Titre / fonction" error={errors.title?.message}>
            <input {...register("title")} className={inputCls} placeholder="Pasteur fondateur de la C.E.C.J." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rôle" error={errors.role?.message}>
              <select {...register("role")} className={inputCls}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Ordre d'affichage" error={errors.order?.message}>
              <input {...register("order", { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="0" />
            </Field>
          </div>

          <Field label="Biographie" error={errors.bio?.message}>
            <textarea {...register("bio")} rows={4} className={cn(inputCls, "resize-none")} placeholder="Quelques mots sur ce leader…" />
          </Field>

          <Field label="Photo" error={errors.photoUrl?.message}>
            <ImageUpload
              value={watch("photoUrl") ?? ""}
              onChange={(url) => setValue("photoUrl", url, { shouldValidate: true })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} placeholder="leader@cecj.org" />
            </Field>
            <Field label="Téléphone" error={errors.phone?.message}>
              <input {...register("phone")} className={inputCls} placeholder="+243 81 000 0000" />
            </Field>
          </div>

          <Field label="Statut" error={errors.isActive?.message}>
            <select {...register("isActive", { setValueAs: (v) => v === "true" || v === true })} className={inputCls}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Créer le leader"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
