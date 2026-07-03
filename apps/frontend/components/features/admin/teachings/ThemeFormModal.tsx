"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/ImageUpload"
import type { AdminTheme, ThemePayload } from "@/lib/api/admin/teachings"

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  nameFr:        z.string().min(1, "Le nom est requis"),
  nameEn:        z.string().optional(),
  descriptionFr: z.string().optional(),
  coverImage:    z.string().optional(),
  position:      z.number().int().min(0).optional(),
  isActive:      z.boolean(),
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
  onSubmit: (values: ThemePayload) => Promise<void>
  initialData?: AdminTheme | null
}

export function ThemeFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            nameFr:        initialData.nameFr,
            nameEn:        initialData.nameEn ?? "",
            descriptionFr: initialData.descriptionFr ?? "",
            coverImage:    initialData.coverImage ?? "",
            position:      initialData.position,
            isActive:      initialData.isActive,
          }
        : { isActive: true, position: 0 },
    )
  }, [open, initialData, reset])

  if (!open) return null

  const submit = async (values: FormValues) => {
    await onSubmit({
      nameFr:        values.nameFr,
      nameEn:        values.nameEn || undefined,
      descriptionFr: values.descriptionFr || undefined,
      coverImage:    values.coverImage || undefined,
      position:      values.position ?? 0,
      isActive:      values.isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier le thème" : "Créer un thème"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom (français) *" error={errors.nameFr?.message}>
              <input {...register("nameFr")} className={inputCls} placeholder="La Foi" />
            </Field>
            <Field label="Nom (anglais)" error={errors.nameEn?.message}>
              <input {...register("nameEn")} className={inputCls} placeholder="Faith" />
            </Field>
          </div>

          <Field label="Description" error={errors.descriptionFr?.message}>
            <textarea
              {...register("descriptionFr")}
              rows={3}
              className={cn(inputCls, "resize-none")}
              placeholder="De quoi parle cette série d'enseignements…"
            />
          </Field>

          <Field label="Image de couverture" error={errors.coverImage?.message}>
            <ImageUpload
              value={watch("coverImage") ?? ""}
              onChange={(url) => setValue("coverImage", url, { shouldValidate: true })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ordre d'affichage" error={errors.position?.message}>
              <input {...register("position", { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </Field>
            <Field label="Statut" error={errors.isActive?.message}>
              <select {...register("isActive", { setValueAs: (v) => v === "true" || v === true })} className={inputCls}>
                <option value="true">Actif (visible sur le site)</option>
                <option value="false">Inactif</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Créer le thème"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
