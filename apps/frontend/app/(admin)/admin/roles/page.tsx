"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { RolesTable } from "@/components/features/admin/roles/RolesTable"
import { RoleFormModal } from "@/components/features/admin/roles/RoleFormModal"
import { useAdminRoles, useCreateRole, useDeleteRole, useUpdateRole } from "@/hooks/admin/useAdminRoles"
import type { AdminRole } from "@/lib/api/admin/roles"
import type { RoleFormValues } from "@/lib/validations/admin/role"

export default function RolesPage() {
  const { data: roles = [], isLoading, isError } = useAdminRoles()

  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<AdminRole | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (role: AdminRole) => { setEditTarget(role); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: RoleFormValues) => {
    const payload = { ...values, description: values.description || undefined }
    try {
      if (editTarget) {
        await updateRole.mutateAsync({ id: editTarget.id, payload })
      } else {
        await createRole.mutateAsync(payload)
      }
      closeModal()
    } catch {
      // Erreur déjà toastée par le MutationCache — la modale reste ouverte.
    }
  }

  return (
    <>
      <RoleFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Rôles & Permissions"
          subtitle="Contrôle d'accès basé sur les rôles (RBAC)"
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Créer un rôle
            </Button>
          }
        />

        <div className="flex gap-4">
          {[
            { label: "Total des rôles",   value: roles.length },
            { label: "Rôles avec membres", value: roles.filter((r) => r._count.users > 0).length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : (
          <RolesTable roles={roles} onEdit={openEdit} onDelete={async (id) => { await deleteRole.mutateAsync(id) }} />
        )}
      </div>
    </>
  )
}
