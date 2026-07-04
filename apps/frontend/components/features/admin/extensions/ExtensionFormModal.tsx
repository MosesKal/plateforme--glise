"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { extensionSchema, type ExtensionFormValues } from "@/lib/validations/admin/extension"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/ImageUpload"
import type { AdminExtension } from "@/lib/api/admin/extensions"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
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
  onSubmit: (values: ExtensionFormValues) => Promise<void>
  initialData?: AdminExtension | null
}

export function ExtensionFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExtensionFormValues>({
    resolver: zodResolver(extensionSchema),
  })

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              name:        initialData.name,
              country:     initialData.country,
              city:        initialData.city,
              address:     initialData.address ?? "",
              phone:       initialData.phone ?? "",
              email:       initialData.email ?? "",
              pastorName:  initialData.pastorName ?? "",
              pastorPhone: initialData.pastorPhone ?? "",
              latitude:    initialData.latitude ?? undefined,
              longitude:   initialData.longitude ?? undefined,
              status:      initialData.status,
              coverImage:  initialData.coverImage ?? "",
              description: initialData.description ?? "",
              foundedAt:   initialData.foundedAt ? toDateInput(initialData.foundedAt) : "",
            }
          : { status: "ACTIVE" },
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
            {isEdit ? "Modifier l'extension" : "Ajouter une extension"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">

          {/* Identification */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <Field label="Nom de l'extension *" error={errors.name?.message}>
                <input {...register("name")} className={inputCls} placeholder="Église CECJC — Bruxelles" />
              </Field>
            </div>
            <Field label="Pays *" error={errors.country?.message}>
              <input {...register("country")} className={inputCls} placeholder="Belgique" />
            </Field>
            <Field label="Ville *" error={errors.city?.message}>
              <input {...register("city")} className={inputCls} placeholder="Bruxelles" />
            </Field>
            <Field label="Adresse">
              <input {...register("address")} className={inputCls} placeholder="12 Rue des Fleurs…" />
            </Field>
          </div>

          {/* Pasteur */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom du pasteur">
              <input {...register("pastorName")} className={inputCls} placeholder="Pasteur Jean Dupont" />
            </Field>
            <Field label="Téléphone du pasteur">
              <input {...register("pastorPhone")} className={inputCls} placeholder="+32 470 000 000" />
            </Field>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone">
              <input {...register("phone")} className={inputCls} placeholder="+32 470 000 000" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} placeholder="contact@cecj-bruxelles.org" />
            </Field>
          </div>

          {/* Géolocalisation */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input {...register("latitude", { valueAsNumber: true })} type="number" step="any" className={inputCls} placeholder="50.8503" />
            </Field>
            <Field label="Longitude">
              <input {...register("longitude", { valueAsNumber: true })} type="number" step="any" className={inputCls} placeholder="4.3517" />
            </Field>
          </div>

          {/* Médias & date */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Image de couverture">
              <ImageUpload
                value={watch("coverImage") ?? ""}
                onChange={(url) => setValue("coverImage", url, { shouldValidate: true })}
              />
            </Field>
            <Field label="Date de fondation">
              <input {...register("foundedAt")} type="date" className={inputCls} />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea {...register("description")} rows={3} className={cn(inputCls, "resize-none")} placeholder="Présentation de l'extension…" />
          </Field>

          {/* Statut */}
          <Field label="Statut">
            <select {...register("status")} className={inputCls}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMING_SOON">Bientôt</option>
            </select>
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
            >
              {isEdit ? "Enregistrer" : "Ajouter l'extension"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
