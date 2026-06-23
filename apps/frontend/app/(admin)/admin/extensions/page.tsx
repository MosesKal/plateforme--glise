"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { ExtensionsTable } from "@/components/features/admin/extensions/ExtensionsTable"
import { ExtensionFormModal } from "@/components/features/admin/extensions/ExtensionFormModal"
import {
  useAdminExtensions,
  useCreateExtension,
  useDeleteExtension,
  useUpdateExtension,
} from "@/hooks/admin/useAdminExtensions"
import type { AdminExtension } from "@/lib/api/admin/extensions"
import type { ExtensionFormValues } from "@/lib/validations/admin/extension"

export default function AdminExtensionsPage() {
  const { data: extensions = [], isLoading, isError } = useAdminExtensions()

  const createExtension = useCreateExtension()
  const updateExtension = useUpdateExtension()
  const deleteExtension = useDeleteExtension()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<AdminExtension | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (ext: AdminExtension) => { setEditTarget(ext); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: ExtensionFormValues) => {
    const payload = {
      ...values,
      address:     values.address     || undefined,
      phone:       values.phone       || undefined,
      email:       values.email       || undefined,
      pastorName:  values.pastorName  || undefined,
      pastorPhone: values.pastorPhone || undefined,
      coverImage:  values.coverImage  || undefined,
      description: values.description || undefined,
      foundedAt:   values.foundedAt   ? new Date(values.foundedAt).toISOString() : undefined,
    }
    if (editTarget) {
      await updateExtension.mutateAsync({ id: editTarget.id, payload })
    } else {
      await createExtension.mutateAsync(payload)
    }
    closeModal()
  }

  const handleDelete = async (id: string) => {
    await deleteExtension.mutateAsync(id)
  }

  const active     = extensions.filter((e) => e.status === "ACTIVE").length
  const inactive   = extensions.filter((e) => e.status === "INACTIVE").length
  const comingSoon = extensions.filter((e) => e.status === "COMING_SOON").length

  return (
    <>
      <ExtensionFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Extensions"
          subtitle="Gestion des extensions et implantations de la C.E.C.J."
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Ajouter une extension
            </Button>
          }
        />

        {/* Stats rapides */}
        <div className="flex gap-4">
          {[
            { label: "Total",    value: extensions.length, color: "text-gray-900"  },
            { label: "Actives",  value: active,             color: "text-green-600" },
            { label: "Inactives",value: inactive,           color: "text-gray-500"  },
            { label: "Bientôt",  value: comingSoon,         color: "text-amber-600" },
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
            Erreur lors du chargement des extensions. Vérifiez que le backend est démarré.
          </div>
        ) : (
          <ExtensionsTable
            extensions={extensions}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  )
}
