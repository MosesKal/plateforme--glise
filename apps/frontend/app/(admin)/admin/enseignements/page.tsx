"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { SermonsTable } from "@/components/features/admin/sermons/SermonsTable"
import { SermonFormModal } from "@/components/features/admin/sermons/SermonFormModal"
import {
  useAdminSermons,
  useAdminSermonCategories,
  useCreateSermon,
  useUpdateSermon,
  useDeleteSermon,
  useCreateSermonCategory,
  useDeleteSermonCategory,
  type AdminSermon,
} from "@/hooks/admin/useAdminSermons"

export default function AdminEnseignementsPage() {
  const [statusFilter,   setStatusFilter]   = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("")

  const { data: sermonsData, isLoading, isError } = useAdminSermons({
    status:     statusFilter !== "all" ? statusFilter : undefined,
    categoryId: categoryFilter || undefined,
  })
  const { data: categories = [] } = useAdminSermonCategories()

  const sermons = sermonsData?.items ?? []

  const createSermon = useCreateSermon()
  const updateSermon = useUpdateSermon()
  const deleteSermon = useDeleteSermon()
  const createCategory = useCreateSermonCategory()
  const deleteCategory = useDeleteSermonCategory()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<AdminSermon | null>(null)

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (s: AdminSermon) => { setEditTarget(s); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: {
    title: string; speaker: string; description?: string;
    videoUrl?: string; audioUrl?: string; pdfUrl?: string;
    coverImage?: string; categoryId?: string; publishedAt?: string; isPublished: boolean
  }) => {
    const payload = {
      title:       values.title,
      speaker:     values.speaker,
      description: values.description  || undefined,
      videoUrl:    values.videoUrl     || undefined,
      audioUrl:    values.audioUrl     || undefined,
      pdfUrl:      values.pdfUrl       || undefined,
      coverImage:  values.coverImage   || undefined,
      categoryId:  values.categoryId   || undefined,
      publishedAt: values.publishedAt  || undefined,
      isPublished: values.isPublished,
    }
    if (editTarget) {
      await updateSermon.mutateAsync({ id: editTarget.id, payload })
    } else {
      await createSermon.mutateAsync(payload)
    }
    closeModal()
  }

  const handleAddCategory = async () => {
    const name = prompt("Nom de la catégorie :")
    if (!name?.trim()) return
    await createCategory.mutateAsync(name.trim())
  }

  const handleDeleteCategory = async (id: string) => {
    const cat = categories.find((c) => c.id === id)
    if (!cat) return
    if ((cat._count?.sermons ?? 0) > 0) {
      alert(`Impossible de supprimer "${cat.name}" : ${cat._count!.sermons} sermon(s) associé(s).`)
      return
    }
    await deleteCategory.mutateAsync(id)
  }

  const published = sermons.filter((s) => s.isPublished).length
  const drafts    = sermons.filter((s) => !s.isPublished).length

  return (
    <>
      <SermonFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
        categories={categories}
      />

      <div className="space-y-6">
        <PageHeader
          title="Enseignements"
          subtitle="Gestion des sermons et messages"
          action={
            <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90">
              + Ajouter un enseignement
            </Button>
          }
        />

        <div className="flex gap-4">
          {[
            { label: "Total",      value: sermonsData?.total ?? 0, color: "text-gray-900"  },
            { label: "Publiés",    value: published,                color: "text-green-600" },
            { label: "Brouillons", value: drafts,                   color: "text-gray-500"  },
            { label: "Catégories", value: categories.length,        color: "text-cecj-green" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all",       label: "Tous"       },
              { value: "published", label: "Publiés"    },
              { value: "draft",     label: "Brouillons" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === value
                    ? "bg-cecj-green text-white"
                    : "border border-gray-200 text-gray-600 hover:border-cecj-green hover:text-cecj-green"
                }`}
              >
                {label}
              </button>
            ))}

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-cecj-green"
            >
              <option value="">Toutes catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Catégories :</span>
            <div className="flex flex-wrap gap-1">
              {categories.map((c) => (
                <span key={c.id} className="flex items-center gap-1 rounded-full bg-gray-100 pl-2.5 pr-1 py-0.5 text-xs text-gray-600">
                  {c.name}
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Button variant="secondary" onClick={handleAddCategory} className="text-xs px-2 py-1">
              + Catégorie
            </Button>
          </div>
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
          <SermonsTable
            sermons={sermons}
            onEdit={openEdit}
            onDelete={async (id) => { await deleteSermon.mutateAsync(id) }}
          />
        )}
      </div>
    </>
  )
}
