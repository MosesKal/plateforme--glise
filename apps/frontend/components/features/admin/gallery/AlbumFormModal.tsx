"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { ImageUpload } from "@/components/ui/ImageUpload"
import type { GalleryAlbum } from "@/lib/api/admin/gallery"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  title:       z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  coverUrl:    z.string().optional(),
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
  initialData?: GalleryAlbum | null
}

export function AlbumFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? { title: initialData.title, description: initialData.description ?? "", coverUrl: initialData.coverUrl ?? "" }
        : { title: "", description: "", coverUrl: "" },
    )
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'album" : "Créer un album"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <Field label="Titre *" error={errors.title?.message}>
            <input {...register("title")} className={inputCls} placeholder="Culte de Noël 2024" />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} className={inputCls} rows={3} placeholder="Description optionnelle…" />
          </Field>
          <Field label="Image de couverture" error={errors.coverUrl?.message}>
            <Controller
              name="coverUrl"
              control={control}
              render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Créer l'album"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
