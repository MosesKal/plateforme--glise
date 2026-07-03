"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/ImageUpload"
import type { Speaker, SpeakerPayload } from "@/lib/api/admin/teachings"

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  fullName: z.string().min(1, "Le nom est requis"),
  title:    z.string().optional(),
  bio:      z.string().optional(),
  photoUrl: z.string().optional(),
  isActive: z.boolean(),
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
  onSubmit: (values: SpeakerPayload) => Promise<void>
  initialData?: Speaker | null
}

export function SpeakerFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            fullName: initialData.fullName,
            title:    initialData.title ?? "",
            bio:      initialData.bio ?? "",
            photoUrl: initialData.photoUrl ?? "",
            isActive: initialData.isActive,
          }
        : { isActive: true },
    )
  }, [open, initialData, reset])

  if (!open) return null

  const submit = async (values: FormValues) => {
    await onSubmit({
      fullName: values.fullName,
      title:    values.title || undefined,
      bio:      values.bio || undefined,
      photoUrl: values.photoUrl || undefined,
      isActive: values.isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'orateur" : "Ajouter un orateur"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom complet *" error={errors.fullName?.message}>
              <input {...register("fullName")} className={inputCls} placeholder="Pasteur Jean Dupont" />
            </Field>
            <Field label="Titre" error={errors.title?.message}>
              <input {...register("title")} className={inputCls} placeholder="Pasteur principal" />
            </Field>
          </div>

          <Field label="Biographie" error={errors.bio?.message}>
            <textarea {...register("bio")} rows={3} className={cn(inputCls, "resize-none")} />
          </Field>

          <Field label="Photo" error={errors.photoUrl?.message}>
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
              {isEdit ? "Enregistrer" : "Ajouter l'orateur"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
