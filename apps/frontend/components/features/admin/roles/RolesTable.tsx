"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import type { AdminRole } from "@/lib/api/admin/roles"

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function DeleteConfirm({ name, userCount, onConfirm, onCancel, loading }: {
  name: string; userCount: number; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 text-base font-semibold text-gray-900">Supprimer le rôle ?</h3>
        {userCount > 0 ? (
          <p className="mb-5 text-sm text-red-600">
            Impossible : <span className="font-medium">{userCount} utilisateur(s)</span> ont encore ce rôle.
          </p>
        ) : (
          <p className="mb-5 text-sm text-gray-500">
            Le rôle <span className="font-medium text-gray-700">"{name}"</span> sera définitivement supprimé.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Annuler</Button>
          {userCount === 0 && (
            <Button variant="danger" onClick={onConfirm} loading={loading}>Supprimer</Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface Props {
  roles: AdminRole[]
  onEdit: (role: AdminRole) => void
  onDelete: (id: string) => Promise<void>
}

export function RolesTable({ roles, onEdit, onDelete }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await onDelete(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (roles.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">Aucun rôle configuré. Créez-en un pour commencer.</p>
      </div>
    )
  }

  return (
    <>
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          userCount={deleteTarget._count.users}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-center">Utilisateurs</th>
              <th className="px-4 py-3 text-left">Créé le</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roles.map((role) => (
              <tr key={role.id} className="group transition-colors hover:bg-gray-50/60">

                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{role.name}</span>
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {role.description ?? <span className="text-gray-300">—</span>}
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {role._count.users}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-500">{fmtDate(role.createdAt)}</td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onEdit(role)}
                      title="Modifier"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(role)}
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
