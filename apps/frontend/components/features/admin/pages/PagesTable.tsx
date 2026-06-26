"use client"

import type { SitePage } from "@/lib/api/admin/pages"

interface Props {
  pages: SitePage[]
  onEdit: (page: SitePage) => void
  onDelete: (page: SitePage) => void
}

export function PagesTable({ pages, onEdit, onDelete }: Props) {
  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center">
        <p className="text-sm text-gray-400">Aucune page créée. Cliquez sur « Nouvelle page » pour commencer.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Titre FR</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Dernière modif.</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {pages.map((page) => (
            <tr key={page.id} className="hover:bg-gray-50/60">
              <td className="px-4 py-3 font-medium text-gray-900">{page.titleFr}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">/{page.slug}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  page.published
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${page.published ? "bg-green-500" : "bg-gray-400"}`} />
                  {page.published ? "Publié" : "Brouillon"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400">
                {new Date(page.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(page)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-cecj-green hover:bg-cecj-green/8 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(page)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Supprimer
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
