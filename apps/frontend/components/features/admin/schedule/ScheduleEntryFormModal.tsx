"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  scheduleEntrySchema,
  type ScheduleEntryFormValues,
  DAYS_OPTIONS_LIST,
  CATEGORIES,
} from "@/lib/validations/admin/schedule"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import type { AdminScheduleEntry } from "@/lib/api/admin/schedule"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  onSubmit: (values: ScheduleEntryFormValues) => Promise<void>
  initialData?: AdminScheduleEntry | null
}

export function ScheduleEntryFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleEntryFormValues>({
    resolver: zodResolver(scheduleEntrySchema),
  })

  const isRecurring = watch("isRecurring")

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              title:               initialData.title,
              days:                initialData.days as ScheduleEntryFormValues["days"],
              startTime:           initialData.startTime,
              endTime:             initialData.endTime,
              category:            initialData.category,
              liveOnYoutube:       initialData.liveOnYoutube,
              facebookPhotosAfter: initialData.facebookPhotosAfter,
              isRecurring:         initialData.isRecurring,
              weekStart:           initialData.weekStart ? initialData.weekStart.slice(0, 10) : "",
              sortOrder:           initialData.sortOrder,
              isActive:            initialData.isActive,
            }
          : { isRecurring: true, liveOnYoutube: false, facebookPhotosAfter: false, isActive: true, sortOrder: 0, days: [] },
      )
    }
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'activité" : "Nouvelle activité"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">

          <Field label="Titre de l'activité *" error={errors.title?.message}>
            <input {...register("title")} className={inputCls} placeholder="Culte Matinal, Nuit de Prière…" />
          </Field>

          {/* Jours */}
          <Field label="Jours *" error={errors.days?.message}>
            <Controller
              name="days"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {DAYS_OPTIONS_LIST.map((day) => {
                    const selected = field.value?.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const current = field.value ?? []
                          field.onChange(
                            selected ? current.filter((d) => d !== day) : [...current, day],
                          )
                        }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                          selected
                            ? "bg-cecj-green text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </Field>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Heure de début *" error={errors.startTime?.message}>
              <input {...register("startTime")} type="time" className={inputCls} />
            </Field>
            <Field label="Heure de fin *" error={errors.endTime?.message}>
              <input {...register("endTime")} type="time" className={inputCls} />
            </Field>
          </div>

          {/* Catégorie + Ordre */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Catégorie *" error={errors.category?.message}>
              <select {...register("category")} className={inputCls}>
                <option value="">Choisir…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Ordre d'affichage">
              <input {...register("sortOrder", { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="0" />
            </Field>
          </div>

          {/* Type : récurrent ou semaine spécifique */}
          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type d'activité</p>
            <Controller
              name="isRecurring"
              control={control}
              render={({ field }) => (
                <div className="flex gap-6">
                  {[
                    { value: true,  label: "Récurrent (chaque semaine)" },
                    { value: false, label: "Semaine spéciale" },
                  ].map(({ value, label }) => (
                    <label key={String(value)} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        className="h-4 w-4 text-cecj-green"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            />
            {isRecurring === false && (
              <Field label="Semaine du (saisissez n'importe quel jour de la semaine)" error={errors.weekStart?.message}>
                <input {...register("weekStart")} type="date" className={inputCls} />
              </Field>
            )}
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-5">
            <label className="flex cursor-pointer items-center gap-2">
              <input {...register("liveOnYoutube")} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-cecj-green" />
              <span className="text-sm text-gray-700">Diffusé en direct YouTube</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input {...register("facebookPhotosAfter")} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-cecj-green" />
              <span className="text-sm text-gray-700">Photos sur Facebook après</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input {...register("isActive")} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-cecj-green" />
              <span className="text-sm text-gray-700">Actif</span>
            </label>
          </div>

          {/* Actions */}
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
