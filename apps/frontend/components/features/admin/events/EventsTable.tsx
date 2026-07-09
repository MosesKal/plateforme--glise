"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { EventStatusBadge } from "./EventStatusBadge"
import { cn } from "@/lib/utils"
import type { AdminEvent, EventStatus } from "@/lib/api/admin/events"

// ─── Date formatter ────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function EditIcon()   { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625" /></svg> }
function TrashIcon()  { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> }
function StarIcon({ filled }: { filled: boolean }) { return <svg className={cn("h-4 w-4", filled ? "fill-cecj-gold text-cecj-gold" : "fill-none text-gray-300")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> }

// ─── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 text-base font-semibold text-gray-900">Supprimer l'événement ?</h3>
        <p className="mb-5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">"{name}"</span> sera définitivement supprimé.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Supprimer</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface Props {
  events: AdminEvent[]
  onEdit:   (event: AdminEvent) => void
  onToggleStatus: (event: AdminEvent) => void
  onDelete: (id: string) => Promise<void>
  isToggling: boolean
}

export function EventsTable({ events, onEdit, onToggleStatus, onDelete, isToggling }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await onDelete(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (events.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">Aucun événement. Créez-en un pour commencer.</p>
      </div>
    )
  }

  return (
    <>
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.titleFr}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Événement</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-center">Vedette</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event) => (
              <tr key={event.id} className="group transition-colors hover:bg-gray-50/60">

                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{event.titleFr}</p>
                  {event.speaker && (
                    <p className="mt-0.5 text-xs text-gray-400">{event.speaker}</p>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {event.category ?? <span className="text-gray-300">—</span>}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {fmtDate(event.startDate)}
                </td>

                <td className="px-4 py-3">
                  <EventStatusBadge status={event.status} />
                </td>

                <td className="px-4 py-3 text-center">
                  <StarIcon filled={event.isFeatured} />
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Toggle publish/draft */}
                    <button
                      onClick={() => onToggleStatus(event)}
                      disabled={isToggling}
                      title={event.status === "PUBLISHED" ? "Mettre en brouillon" : "Publier"}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        event.status === "PUBLISHED"
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200",
                      )}
                    >
                      {event.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                    </button>

                    <button
                      onClick={() => onEdit(event)}
                      title="Modifier"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <EditIcon />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(event)}
                      title="Supprimer"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
