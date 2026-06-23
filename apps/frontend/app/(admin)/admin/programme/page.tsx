"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { ScheduleTable } from "@/components/features/admin/schedule/ScheduleTable"
import { ScheduleEntryFormModal } from "@/components/features/admin/schedule/ScheduleEntryFormModal"
import {
  useAdminSchedule,
  useCreateScheduleEntry,
  useDeleteScheduleEntry,
  useUpdateScheduleEntry,
} from "@/hooks/admin/useAdminSchedule"
import type { AdminScheduleEntry } from "@/lib/api/admin/schedule"
import type { ScheduleEntryFormValues } from "@/lib/validations/admin/schedule"

export default function AdminProgrammePage() {
  const { data: entries = [], isLoading, isError } = useAdminSchedule()

  const createEntry = useCreateScheduleEntry()
  const updateEntry = useUpdateScheduleEntry()
  const deleteEntry = useDeleteScheduleEntry()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<AdminScheduleEntry | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (entry: AdminScheduleEntry) => { setEditTarget(entry); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: ScheduleEntryFormValues) => {
    const payload = {
      ...values,
      weekStart:   (!values.isRecurring && values.weekStart) ? values.weekStart : undefined,
      isRecurring: values.isRecurring,
    }
    if (editTarget) {
      await updateEntry.mutateAsync({ id: editTarget.id, payload })
    } else {
      await createEntry.mutateAsync(payload)
    }
    closeModal()
  }

  const handleDelete = async (id: string) => {
    await deleteEntry.mutateAsync(id)
  }

  const recurring = entries.filter((e) => e.isRecurring).length
  const specials  = entries.filter((e) => !e.isRecurring).length

  return (
    <>
      <ScheduleEntryFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Programme de la semaine"
          subtitle="Gérez le programme récurrent et les semaines spéciales"
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Nouvelle activité
            </Button>
          }
        />

        {/* Stats */}
        <div className="flex gap-4">
          {[
            { label: "Total",             value: entries.length, color: "text-gray-900"   },
            { label: "Récurrentes",       value: recurring,      color: "text-cecj-green" },
            { label: "Semaines spéciales", value: specials,      color: "text-amber-600"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <strong>Comment ça marche :</strong> Le site affiche les activités <strong>récurrentes</strong> chaque semaine.
          Si vous créez des activités pour une <strong>semaine spéciale</strong>, elles remplacent entièrement le programme récurrent cette semaine-là.
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré.
          </div>
        ) : (
          <ScheduleTable
            entries={entries}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  )
}
