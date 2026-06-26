"use client"

import { Fragment, useState } from "react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import type { AdminScheduleEntry } from "@/lib/api/admin/schedule"

// ─── Icons ────────────────────────────────────────────────────────────────────

function EditIcon()  { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625" /></svg> }
function TrashIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> }

const CATEGORY_COLORS: Record<string, string> = {
  "Prière":         "bg-blue-100 text-blue-700",
  "Famille":        "bg-pink-100 text-pink-700",
  "Enseignement":   "bg-purple-100 text-purple-700",
  "Adoration":      "bg-green-100 text-green-700",
  "Évangélisation": "bg-orange-100 text-orange-700",
  "Jeûne":          "bg-amber-100 text-amber-700",
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600")}>
      {category}
    </span>
  )
}

function WeekTag({ weekStart }: { weekStart: string }) {
  const monday = new Date(weekStart)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      {fmt(monday)} – {fmt(sunday)}
    </span>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 text-base font-semibold text-gray-900">Supprimer l'activité ?</h3>
        <p className="mb-5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">"{name}"</span> sera définitivement supprimée.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Supprimer</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <tr className="bg-gray-50/80">
      <td colSpan={6} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        {label} <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 font-semibold text-gray-600">{count}</span>
      </td>
    </tr>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const DAYS_FULL  = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

interface Props {
  entries: AdminScheduleEntry[]
  onEdit: (entry: AdminScheduleEntry) => void
  onDelete: (id: string) => Promise<void>
}

export function ScheduleTable({ entries, onEdit, onDelete }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<AdminScheduleEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await onDelete(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const recurring = entries.filter((e) => e.isRecurring)
  const specials  = entries.filter((e) => !e.isRecurring)

  // Group specials by weekStart
  const specialsByWeek = specials.reduce<Record<string, AdminScheduleEntry[]>>((acc, e) => {
    const key = e.weekStart ?? "unknown"
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  if (entries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">Aucune activité. Créez-en une pour commencer.</p>
      </div>
    )
  }

  const Row = ({ entry }: { entry: AdminScheduleEntry }) => (
    <tr className="group transition-colors hover:bg-gray-50/60">
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">{entry.title}</p>
        <p className="text-xs text-gray-400">{entry.startTime} – {entry.endTime}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {DAYS_FULL.map((day, i) => (
            <span
              key={day}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                entry.days.includes(day)
                  ? "bg-cecj-green text-white"
                  : "bg-gray-100 text-gray-300",
              )}
            >
              {DAYS_SHORT[i]}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <CategoryBadge category={entry.category} />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {entry.liveOnYoutube && (
            <span title="YouTube Live" className="text-[#FF0000]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </span>
          )}
          {entry.facebookPhotosAfter && (
            <span title="Photos Facebook" className="text-[#1877F2]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </span>
          )}
          {!entry.liveOnYoutube && !entry.facebookPhotosAfter && (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
          entry.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500",
        )}>
          {entry.isActive ? "Actif" : "Inactif"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => onEdit(entry)} title="Modifier" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <EditIcon />
          </button>
          <button onClick={() => setDeleteTarget(entry)} title="Supprimer" className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <>
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Activité</th>
              <th className="px-4 py-3 text-left">Jours</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-center">Diffusion</th>
              <th className="px-4 py-3 text-center">État</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recurring.length > 0 && (
              <>
                <SectionHeader label="Programme récurrent" count={recurring.length} />
                {recurring.map((e) => <Row key={e.id} entry={e} />)}
              </>
            )}
            {Object.entries(specialsByWeek).map(([weekStart, weekEntries]) => (
              <Fragment key={weekStart}>
                <tr className="bg-amber-50/50">
                  <td colSpan={6} className="px-4 py-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                      <span>Semaine spéciale</span>
                      <WeekTag weekStart={weekStart} />
                      <span className="rounded-full bg-amber-200 px-1.5 py-0.5 font-semibold text-amber-700">{weekEntries.length}</span>
                    </div>
                  </td>
                </tr>
                {weekEntries.map((e) => <Row key={e.id} entry={e} />)}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
