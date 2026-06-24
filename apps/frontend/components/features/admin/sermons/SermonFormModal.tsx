"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import type { AdminSermon, SermonCategory } from "@/lib/api/admin/sermons"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  title:       z.string().min(1, "Le titre est requis"),
  speaker:     z.string().min(1, "Le prédicateur est requis"),
  description: z.string().optional(),
  videoUrl:    z.string().optional(),
  audioUrl:    z.string().optional(),
  pdfUrl:      z.string().optional(),
  coverImage:  z.string().optional(),
  categoryId:  z.string().optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean(),
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
  initialData?: AdminSermon | null
  categories: SermonCategory[]
}

export function SermonFormModal({ open, onClose, onSubmit, initialData, categories }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            title:       initialData.title,
            speaker:     initialData.speaker,
            description: initialData.description ?? "",
            videoUrl:    initialData.videoUrl ?? "",
            audioUrl:    initialData.audioUrl ?? "",
            pdfUrl:      initialData.pdfUrl ?? "",
            coverImage:  initialData.coverImage ?? "",
            categoryId:  initialData.categoryId ?? "",
            publishedAt: initialData.publishedAt ? initialData.publishedAt.slice(0, 10) : "",
            isPublished: initialData.isPublished,
          }
        : { isPublished: false, categoryId: "" },
    )
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'enseignement" : "Ajouter un enseignement"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Titre *" error={errors.title?.message}>
                <input {...register("title")} className={inputCls} placeholder="La puissance de la foi" />
              </Field>
            </div>
            <Field label="Prédicateur *" error={errors.speaker?.message}>
              <input {...register("speaker")} className={inputCls} placeholder="Apôtre Jean Kalala" />
            </Field>
            <Field label="Catégorie" error={errors.categoryId?.message}>
              <select {...register("categoryId")} className={inputCls}>
                <option value="">Aucune catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={3} className={cn(inputCls, "resize-none")} placeholder="Résumé de l'enseignement…" />
          </Field>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Médias</p>
            <Field label="URL Vidéo (YouTube, Vimeo…)" error={errors.videoUrl?.message}>
              <input {...register("videoUrl")} className={inputCls} placeholder="https://youtube.com/watch?v=…" />
            </Field>
            <Field label="URL Audio (MP3, Dropbox…)" error={errors.audioUrl?.message}>
              <input {...register("audioUrl")} className={inputCls} placeholder="https://…/sermon.mp3" />
            </Field>
            <Field label="URL PDF" error={errors.pdfUrl?.message}>
              <input {...register("pdfUrl")} className={inputCls} placeholder="https://…/notes.pdf" />
            </Field>
            <Field label="Image de couverture" error={errors.coverImage?.message}>
              <input {...register("coverImage")} className={inputCls} placeholder="https://…/cover.jpg" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de publication" error={errors.publishedAt?.message}>
              <input {...register("publishedAt")} type="date" className={inputCls} />
            </Field>
            <Field label="Statut" error={errors.isPublished?.message}>
              <select {...register("isPublished", { setValueAs: (v) => v === "true" || v === true })} className={inputCls}>
                <option value="false">Brouillon</option>
                <option value="true">Publié</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
