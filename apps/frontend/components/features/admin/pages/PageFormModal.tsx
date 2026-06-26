"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import type { SitePage } from "@/lib/api/admin/pages"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"
const textareaCls = `${inputCls} font-mono resize-y`

const schema = z.object({
  slug:            z.string().min(1, "Le slug est requis").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lettres minuscules, chiffres et tirets uniquement"),
  titleFr:         z.string().min(1, "Le titre FR est requis"),
  titleEn:         z.string().optional(),
  contentFr:       z.string().min(1, "Le contenu FR est requis"),
  contentEn:       z.string().optional(),
  metaDescription: z.string().optional(),
  published:       z.boolean(),
})

type FormValues = z.infer<typeof schema>

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: FormValues) => Promise<void>
  initialData?: SitePage | null
}

export function PageFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { published: false } })

  const published = watch("published")

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            slug:            initialData.slug,
            titleFr:         initialData.titleFr,
            titleEn:         initialData.titleEn ?? "",
            contentFr:       initialData.contentFr,
            contentEn:       initialData.contentEn ?? "",
            metaDescription: initialData.metaDescription ?? "",
            published:       initialData.published,
          }
        : { slug: "", titleFr: "", titleEn: "", contentFr: "", contentEn: "", metaDescription: "", published: false },
    )
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier la page" : "Créer une page"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug *" hint="ex: presentation" error={errors.slug?.message}>
              <input
                {...register("slug")}
                className={inputCls}
                placeholder="ma-page"
                disabled={isEdit}
              />
            </Field>
            <Field label="Statut">
              <button
                type="button"
                onClick={() => setValue("published", !published)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  published
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${published ? "bg-green-500" : "bg-gray-400"}`} />
                {published ? "Publié" : "Brouillon"}
              </button>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Titre FR *" error={errors.titleFr?.message}>
              <input {...register("titleFr")} className={inputCls} placeholder="Présentation de l'église" />
            </Field>
            <Field label="Titre EN">
              <input {...register("titleEn")} className={inputCls} placeholder="Church presentation" />
            </Field>
          </div>

          <Field label="Contenu FR * (Markdown)" error={errors.contentFr?.message}>
            <textarea {...register("contentFr")} className={textareaCls} rows={8} placeholder="## Introduction&#10;&#10;Contenu en **Markdown**…" />
          </Field>

          <Field label="Contenu EN (Markdown)">
            <textarea {...register("contentEn")} className={textareaCls} rows={8} placeholder="## Introduction&#10;&#10;Content in **Markdown**…" />
          </Field>

          <Field label="Meta description (SEO)">
            <input {...register("metaDescription")} className={inputCls} placeholder="Description courte pour les moteurs de recherche (160 caractères max)" />
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Créer la page"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
