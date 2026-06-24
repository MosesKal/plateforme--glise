"use client"

import type { AdminSermon } from "@/lib/api/admin/sermons"

interface Props {
  sermons: AdminSermon[]
  onEdit: (sermon: AdminSermon) => void
  onDelete: (id: string) => void
}

function MediaBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {label}
    </span>
  )
}

export function SermonsTable({ sermons, onEdit, onDelete }: Props) {
  if (sermons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-400">Aucun enseignement. Ajoutez votre premier sermon.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Titre</th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 md:table-cell">Prédicateur</th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 lg:table-cell">Catégorie</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Médias</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Statut</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sermons.map((sermon) => (
            <tr key={sermon.id} className="group hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900 line-clamp-1">{sermon.title}</p>
                {sermon.publishedAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(sermon.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </td>
              <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{sermon.speaker}</td>
              <td className="hidden px-4 py-3 lg:table-cell">
                {sermon.category ? (
                  <span className="rounded-full bg-cecj-green/10 px-2.5 py-0.5 text-xs font-semibold text-cecj-green">
                    {sermon.category.name}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {sermon.videoUrl && <MediaBadge label="Vidéo" color="bg-red-50 text-red-600" />}
                  {sermon.audioUrl && <MediaBadge label="Audio" color="bg-blue-50 text-blue-600" />}
                  {sermon.pdfUrl   && <MediaBadge label="PDF"   color="bg-amber-50 text-amber-600" />}
                  {!sermon.videoUrl && !sermon.audioUrl && !sermon.pdfUrl && (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  sermon.isPublished
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sermon.isPublished ? "bg-green-500" : "bg-gray-400"}`} />
                  {sermon.isPublished ? "Publié" : "Brouillon"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(sermon)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Modifier"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(sermon.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Supprimer"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
