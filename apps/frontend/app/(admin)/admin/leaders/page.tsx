"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { LeaderFormModal } from "@/components/features/admin/leaders/LeaderFormModal"
import {
  useAdminLeaders,
  useCreateLeader,
  useUpdateLeader,
  useDeleteLeader,
  type Leader,
} from "@/hooks/admin/useAdminLeaders"

const ROLE_LABELS: Record<string, string> = {
  FOUNDER:       "Fondateur",
  SENIOR_PASTOR: "Pasteur Principal",
  PASTOR:        "Pasteur",
  ELDER:         "Ancien",
  DEACON:        "Diacre",
  WORSHIP_LEADER:"Resp. Louange",
  YOUTH_LEADER:  "Resp. Jeunesse",
  OTHER:         "Autre",
}

export default function AdminLeadersPage() {
  const { data: leaders = [], isLoading, isError } = useAdminLeaders()

  const create = useCreateLeader()
  const update = useUpdateLeader()
  const remove = useDeleteLeader()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<Leader | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (l: Leader) => { setEditTarget(l); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: {
    firstName: string; lastName: string; title?: string; role?: string
    bio?: string; photoUrl?: string; email?: string; phone?: string
    order?: number; isActive: boolean
  }) => {
    const payload = {
      firstName: values.firstName,
      lastName:  values.lastName,
      title:     values.title    || undefined,
      role:      (values.role    || undefined) as Leader["role"] | undefined,
      bio:       values.bio      || undefined,
      photoUrl:  values.photoUrl || undefined,
      email:     values.email    || undefined,
      phone:     values.phone    || undefined,
      order:     values.order ?? 0,
      isActive:  values.isActive,
    }
    if (editTarget) {
      await update.mutateAsync({ id: editTarget.id, payload })
    } else {
      await create.mutateAsync(payload)
    }
    closeModal()
  }

  const active   = leaders.filter((l) => l.isActive).length
  const inactive = leaders.filter((l) => !l.isActive).length

  return (
    <>
      <LeaderFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Leadership"
          subtitle="Équipe de direction et ministres de la C.E.C.J.C."
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Ajouter un leader
            </Button>
          }
        />

        <div className="flex gap-4">
          {[
            { label: "Total",    value: leaders.length, color: "text-gray-900"  },
            { label: "Actifs",   value: active,          color: "text-green-600" },
            { label: "Inactifs", value: inactive,         color: "text-gray-500"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : leaders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">Aucun leader. Créez le premier.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((leader) => (
              <div
                key={leader.id}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Photo ou avatar */}
                <div className="relative h-36 overflow-hidden bg-cecj-green/10">
                  {leader.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={leader.photoUrl}
                      alt={`${leader.firstName} ${leader.lastName}`}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cecj-green/20 to-cecj-green/5">
                      <span className="text-4xl font-bold text-cecj-green/30">
                        {leader.firstName[0]}{leader.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-cecj-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cecj-green">
                      {ROLE_LABELS[leader.role] ?? leader.role}
                    </span>
                  </div>
                  {!leader.isActive && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-gray-800/70 px-2 py-0.5 text-[10px] font-semibold text-gray-200">
                        Inactif
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900">
                    {leader.firstName} {leader.lastName}
                  </h3>
                  {leader.title && (
                    <p className="mt-0.5 text-xs text-cecj-green/80">{leader.title}</p>
                  )}
                  {leader.bio && (
                    <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{leader.bio}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-gray-300">Ordre : {leader.order}</span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(leader)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => remove.mutate(leader.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
