"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { EventsTable } from "@/components/features/admin/events/EventsTable"
import { EventFormModal } from "@/components/features/admin/events/EventFormModal"
import { useAdminEvents, useCreateEvent, useDeleteEvent, useUpdateEvent } from "@/hooks/admin/useAdminEvents"
import type { AdminEvent } from "@/lib/api/admin/events"
import type { EventFormValues } from "@/lib/validations/admin/event"

export default function AdminEvenementsPage() {
  const { data: events = [], isLoading, isError } = useAdminEvents()

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<AdminEvent | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (event: AdminEvent) => { setEditTarget(event); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: EventFormValues) => {
    const payload = {
      ...values,
      endDate:    values.endDate    || undefined,
      titleEn:    values.titleEn    || undefined,
      category:   values.category   || undefined,
      speaker:    values.speaker    || undefined,
      organizer:  values.organizer  || undefined,
      location:   values.location   || undefined,
      address:    values.address    || undefined,
      coverImage: values.coverImage || undefined,
    }
    if (editTarget) {
      await updateEvent.mutateAsync({ id: editTarget.id, payload })
    } else {
      await createEvent.mutateAsync(payload)
    }
    closeModal()
  }

  const handleToggleStatus = (event: AdminEvent) => {
    const nextStatus = event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    updateEvent.mutate({ id: event.id, payload: { status: nextStatus } })
  }

  const handleDelete = async (id: string) => {
    await deleteEvent.mutateAsync(id)
  }

  const published = events.filter((e) => e.status === "PUBLISHED").length
  const drafts    = events.filter((e) => e.status === "DRAFT").length

  return (
    <>
      <EventFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Événements"
          subtitle="Gestion des événements publiés sur le site"
          action={<Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">+ Créer un événement</Button>}
        />

        {/* Stats rapides */}
        <div className="flex gap-4">
          {[
            { label: "Total",    value: events.length, color: "text-gray-900" },
            { label: "Publiés",  value: published,      color: "text-green-600" },
            { label: "Brouillons", value: drafts,       color: "text-gray-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
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
            Erreur lors du chargement des événements. Vérifiez que le backend est démarré.
          </div>
        ) : (
          <EventsTable
            events={events}
            onEdit={openEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            isToggling={updateEvent.isPending}
          />
        )}
      </div>
    </>
  )
}
