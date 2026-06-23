"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventSchema, type EventFormValues } from "@/lib/validations/admin/event"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import type { AdminEvent } from "@/lib/api/admin/events"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetime(iso: string): string {
  return iso.slice(0, 16)
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: EventFormValues) => Promise<void>
  initialData?: AdminEvent | null
}

export function EventFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  })

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              titleFr:       initialData.titleFr,
              titleEn:       initialData.titleEn ?? "",
              descriptionFr: initialData.descriptionFr ?? "",
              category:      initialData.category ?? "",
              speaker:       initialData.speaker ?? "",
              organizer:     initialData.organizer ?? "",
              startDate:     toLocalDatetime(initialData.startDate),
              endDate:       initialData.endDate ? toLocalDatetime(initialData.endDate) : "",
              location:      initialData.location ?? "",
              address:       initialData.address ?? "",
              coverImage:    initialData.coverImage ?? "",
              status:        initialData.status,
              isFeatured:    initialData.isFeatured,
            }
          : { status: "DRAFT", isFeatured: false },
      )
    }
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'événement" : "Créer un événement"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">

          <div className="grid grid-cols-2 gap-4">
            <Field label="Titre (FR) *" error={errors.titleFr?.message}>
              <input {...register("titleFr")} className={inputCls} placeholder="Titre en français" />
            </Field>
            <Field label="Titre (EN)">
              <input {...register("titleEn")} className={inputCls} placeholder="Title in English" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Catégorie">
              <input {...register("category")} className={inputCls} placeholder="Louange & Adoration…" />
            </Field>
            <Field label="Orateur">
              <input {...register("speaker")} className={inputCls} placeholder="Pasteur…" />
            </Field>
            <Field label="Organisateur">
              <input {...register("organizer")} className={inputCls} placeholder="Département…" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de début *" error={errors.startDate?.message}>
              <input {...register("startDate")} type="datetime-local" className={inputCls} />
            </Field>
            <Field label="Date de fin">
              <input {...register("endDate")} type="datetime-local" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ville / Lieu">
              <input {...register("location")} className={inputCls} placeholder="Lubumbashi" />
            </Field>
            <Field label="Adresse">
              <input {...register("address")} className={inputCls} placeholder="13 Av. Bondo…" />
            </Field>
          </div>

          <Field label="URL de l'image de couverture">
            <input {...register("coverImage")} className={inputCls} placeholder="/event_avenir.jpeg ou https://…" />
          </Field>

          <Field label="Description">
            <textarea {...register("descriptionFr")} rows={3} className={cn(inputCls, "resize-none")} placeholder="Description de l'événement…" />
          </Field>

          <div className="flex items-center gap-6">
            <Field label="Statut">
              <select {...register("status")} className={inputCls}>
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </Field>
            <label className="flex cursor-pointer items-center gap-2 pt-5">
              <input {...register("isFeatured")} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-cecj-green" />
              <span className="text-sm font-medium text-gray-700">Événement en vedette</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
            >
              {isEdit ? "Enregistrer" : "Créer l'événement"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
