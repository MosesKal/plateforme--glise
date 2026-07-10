"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { DepartmentFormModal } from "@/components/features/admin/departments/DepartmentFormModal"
import {
  useAdminDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type Department,
} from "@/hooks/admin/useAdminDepartments"

export default function AdminDepartementsPage() {
  const { data: departments = [], isLoading, isError } = useAdminDepartments()

  const create = useCreateDepartment()
  const update = useUpdateDepartment()
  const remove = useDeleteDepartment()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<Department | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (d: Department) => { setEditTarget(d); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: {
    name: string; description?: string; leaderName?: string;
    photoUrl?: string; order?: number; isActive: boolean
  }) => {
    const payload = {
      name:        values.name,
      description: values.description  || undefined,
      leaderName:  values.leaderName   || undefined,
      photoUrl:    values.photoUrl     || undefined,
      order:       values.order ?? 0,
      isActive:    values.isActive,
    }
    try {
      if (editTarget) {
        await update.mutateAsync({ id: editTarget.id, payload })
      } else {
        await create.mutateAsync(payload)
      }
      closeModal()
    } catch {
      // Erreur déjà toastée par le MutationCache — la modale reste ouverte.
    }
  }

  const active   = departments.filter((d) => d.isActive).length
  const inactive = departments.filter((d) => !d.isActive).length

  return (
    <>
      <DepartmentFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Départements"
          subtitle="Structure et ministères de la C.E.C.J.C."
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Ajouter un département
            </Button>
          }
        />

        <div className="flex gap-4">
          {[
            { label: "Total",    value: departments.length, color: "text-gray-900"  },
            { label: "Actifs",   value: active,             color: "text-green-600" },
            { label: "Inactifs", value: inactive,           color: "text-gray-500"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : departments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">Aucun département. Créez le premier.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-3 h-1 w-12 rounded ${dept.isActive ? "bg-cecj-green" : "bg-gray-200"}`} />

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{dept.name}</h3>
                    {dept.leaderName && (
                      <p className="mt-0.5 text-xs text-cecj-green/80">{dept.leaderName}</p>
                    )}
                  </div>
                  {!dept.isActive && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      Inactif
                    </span>
                  )}
                </div>

                {dept.description && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{dept.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-gray-300">Ordre : {dept.order}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(dept)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => remove.mutate(dept.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
