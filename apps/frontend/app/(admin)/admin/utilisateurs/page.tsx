"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { UsersTable } from "@/components/features/admin/users/UsersTable"
import { UserFormModal, type UserSubmitPayload } from "@/components/features/admin/users/UserFormModal"
import { useAdminUsers, useCreateUser, useDeleteUser, useUpdateUser } from "@/hooks/admin/useAdminUsers"
import { useAdminRoles } from "@/hooks/admin/useAdminRoles"
import type { AdminUser } from "@/lib/api/admin/users"

export default function UtilisateursPage() {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const { data: roles = [] } = useAdminRoles()

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (user: AdminUser) => { setEditTarget(user); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: UserSubmitPayload) => {
    if (editTarget) {
      await updateUser.mutateAsync({
        id: editTarget.id,
        payload: {
          firstName: values.firstName,
          lastName:  values.lastName,
          email:     values.email,
          password:  values.password,
          phone:     values.phone,
          roleId:    values.roleId,
          status:    values.status,
        },
      })
    } else {
      await createUser.mutateAsync({
        firstName: values.firstName,
        lastName:  values.lastName,
        email:     values.email!,
        password:  values.password!,
        phone:     values.phone,
        roleId:    values.roleId,
        status:    values.status,
      })
    }
    closeModal()
  }

  const active   = users.filter((u) => u.status === "ACTIVE").length
  const inactive = users.filter((u) => u.status !== "ACTIVE").length

  return (
    <>
      <UserFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
        roles={roles}
      />

      <div className="space-y-6">
        <PageHeader
          title="Utilisateurs"
          subtitle="Gestion des comptes administrateurs"
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Ajouter un utilisateur
            </Button>
          }
        />

        <div className="flex gap-4">
          {[
            { label: "Total",                value: users.length, color: "text-gray-900"  },
            { label: "Actifs",               value: active,       color: "text-green-600" },
            { label: "Inactifs / Suspendus", value: inactive,     color: "text-gray-500"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : (
          <UsersTable
            users={users}
            onEdit={openEdit}
            onDelete={async (id) => { await deleteUser.mutateAsync(id) }}
          />
        )}
      </div>
    </>
  )
}
