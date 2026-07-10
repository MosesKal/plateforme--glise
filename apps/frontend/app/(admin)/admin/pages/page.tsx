"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { PagesTable } from "@/components/features/admin/pages/PagesTable"
import { PageFormModal } from "@/components/features/admin/pages/PageFormModal"
import { useAdminPages, useCreatePage, useUpdatePage, useDeletePage } from "@/hooks/admin/useAdminPages"
import type { SitePage, PagePayload } from "@/lib/api/admin/pages"

export default function AdminPagesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SitePage | null>(null)
  const [deleting, setDeleting] = useState<SitePage | null>(null)

  const { data: pages = [], isLoading } = useAdminPages()
  const createPage  = useCreatePage()
  const updatePage  = useUpdatePage()
  const deletePage  = useDeletePage()

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(page: SitePage) { setEditing(page); setModalOpen(true) }

  async function handleSubmit(values: PagePayload) {
    try {
      if (editing) {
        await updatePage.mutateAsync({ id: editing.id, payload: values })
      } else {
        await createPage.mutateAsync(values)
      }
      setModalOpen(false)
    } catch {
      // Erreur déjà toastée par le MutationCache — la modale reste ouverte.
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deletePage.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Erreur déjà toastée par le MutationCache — le dialogue reste ouvert.
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Pages"
          subtitle="Gestion du contenu éditorial du site public"
        />
        <Button onClick={openCreate} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
          Nouvelle page
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <PagesTable pages={pages} onEdit={openEdit} onDelete={setDeleting} />
      )}

      <PageFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
      />

      {/* Modal de confirmation suppression */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-semibold text-gray-900">Supprimer la page</h3>
            <p className="mb-6 text-sm text-gray-500">
              Voulez-vous vraiment supprimer <strong>{deleting.titleFr}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleting(null)}>Annuler</Button>
              <Button
                onClick={handleDelete}
                loading={deletePage.isPending}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
