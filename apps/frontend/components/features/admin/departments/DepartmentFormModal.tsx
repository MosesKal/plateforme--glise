"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/ImageUpload"
import type { Department } from "@/lib/api/admin/departments"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  name:        z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  leaderName:  z.string().optional(),
  photoUrl:    z.string().optional(),
  order:       z.number().int().min(0).optional(),
  isActive:    z.boolean(),
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
  initialData?: Department | null
}

export function DepartmentFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            name:        initialData.name,
            description: initialData.description ?? "",
            leaderName:  initialData.leaderName ?? "",
            photoUrl:    initialData.photoUrl ?? "",
            order:       initialData.order,
            isActive:    initialData.isActive,
          }
        : { isActive: true, order: 0 },
    )
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier le département" : "Ajouter un département"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <Field label="Nom du département *" error={errors.name?.message}>
            <input {...register("name")} className={inputCls} placeholder="Département Jeunesse" />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={3} className={cn(inputCls, "resize-none")} placeholder="Mission et vision du département…" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Responsable" error={errors.leaderName?.message}>
              <input {...register("leaderName")} className={inputCls} placeholder="Pasteur Jean Dupont" />
            </Field>
            <Field label="Ordre d'affichage" error={errors.order?.message}>
              <input {...register("order", { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="0" />
            </Field>
          </div>

          <Field label="Photo / illustration" error={errors.photoUrl?.message}>
            <ImageUpload
              value={watch("photoUrl") ?? ""}
              onChange={(url) => setValue("photoUrl", url, { shouldValidate: true })}
            />
          </Field>

          <Field label="Statut" error={errors.isActive?.message}>
            <select {...register("isActive", { setValueAs: (v) => v === "true" || v === true })} className={inputCls}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Créer le département"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
