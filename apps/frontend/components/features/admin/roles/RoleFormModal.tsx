"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { roleSchema, type RoleFormValues } from "@/lib/validations/admin/role"
import type { AdminRole } from "@/lib/api/admin/roles"

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

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
  onSubmit: (values: RoleFormValues) => Promise<void>
  initialData?: AdminRole | null
}

export function RoleFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  })

  useEffect(() => {
    if (!open) return
    reset(initialData ? { name: initialData.name, description: initialData.description ?? "" } : {})
  }, [open, initialData, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier le rôle" : "Créer un rôle"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">

          <Field label="Nom du rôle *" error={errors.name?.message}>
            <input {...register("name")} className={inputCls} placeholder="Super Admin, Responsable Communication…" />
          </Field>

          <Field label="Description">
            <textarea
              {...register("description")}
              rows={3}
              className={cn(inputCls, "resize-none")}
              placeholder="Décrivez les responsabilités de ce rôle…"
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
            >
              {isEdit ? "Enregistrer" : "Créer le rôle"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
