"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import type { GalleryAlbum, GalleryItem } from "@/lib/api/admin/gallery"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  mediaUrl:  z.string().min(1, "L'URL est requise"),
  title:     z.string().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  albumId:   z.string().optional(),
  order:     z.number().int().min(0).optional(),
})

type FormValues = z.infer<typeof schema>

export type GalleryItemPayload = FormValues

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
  onSubmit: (values: GalleryItemPayload) => Promise<void>
  initialData?: GalleryItem | null
  albums: GalleryAlbum[]
}

export function GalleryItemFormModal({ open, onClose, onSubmit, initialData, albums }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset(
      initialData
        ? {
            mediaUrl:  initialData.mediaUrl,
            title:     initialData.title ?? "",
            mediaType: initialData.mediaType,
            albumId:   initialData.albumId ?? "",
            order:     initialData.order,
          }
        : { mediaType: "IMAGE", albumId: "", order: 0 },
    )
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier le média" : "Ajouter un média"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <Field label="URL du média *" error={errors.mediaUrl?.message}>
            <input {...register("mediaUrl")} className={inputCls} placeholder="https://…/photo.jpg" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type *" error={errors.mediaType?.message}>
              <select {...register("mediaType")} className={inputCls}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Vidéo</option>
              </select>
            </Field>
            <Field label="Ordre" error={errors.order?.message}>
              <input {...register("order", { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="0" />
            </Field>
          </div>

          <Field label="Titre / légende" error={errors.title?.message}>
            <input {...register("title")} className={inputCls} placeholder="Description optionnelle…" />
          </Field>

          <Field label="Album" error={errors.albumId?.message}>
            <select {...register("albumId")} className={inputCls}>
              <option value="">Aucun album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </Field>

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
