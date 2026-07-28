"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import type { AdminTestimony } from "@/lib/api/admin/testimonies"
import { cn } from "@/lib/utils"

const MAX_CONTENT_LENGTH = 2000

interface Props {
  testimony: AdminTestimony
  onClose: () => void
  onSave: (editedContent: string | null) => Promise<void>
  saving: boolean
}

export function TestimonyReviewModal({
  testimony,
  onClose,
  onSave,
  saving,
}: Props) {
  const initialContent = testimony.editedContent ?? testimony.originalContent
  const [draft, setDraft] = useState(initialContent)
  const normalizedDraft = draft.trim()
  const hasCorrection = Boolean(testimony.editedContent)
  const hasChanges =
    normalizedDraft.length > 0 &&
    draft !== initialContent &&
    normalizedDraft !== initialContent

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose, saving])

  const save = async () => {
    if (!hasChanges) return
    await onSave(normalizedDraft)
  }

  const restoreOriginal = async () => {
    await onSave(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-6 backdrop-blur-sm sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="testimony-review-title"
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="testimony-review-title"
                className="text-lg font-semibold text-gray-900"
              >
                Témoignage de {testimony.fullName}
              </h2>
              {hasCorrection && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Version corrigée
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Relecture complète et correction éditoriale
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 sm:px-6">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm leading-relaxed text-amber-800">
              Le message original est conservé sans aucune modification. Vos
              corrections créent une version éditoriale séparée, utilisée sur
              le site public après approbation.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
          <section className="flex min-h-0 flex-col">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Message original
                </h3>
                <p className="text-xs text-gray-500">
                  Lecture seule — source reçue du membre
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Immuable
              </span>
            </div>
            <div className="min-h-72 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                {testimony.originalContent}
              </p>
            </div>
          </section>

          <section className="flex min-h-0 flex-col">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Version corrigée
              </h3>
              <p className="text-xs text-gray-500">
                Corrigez uniquement la frappe et la grammaire sans changer le
                sens du témoignage.
              </p>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              disabled={saving}
              className={cn(
                "min-h-72 flex-1 resize-y rounded-xl border bg-white p-4 text-sm leading-7 text-gray-800 outline-none transition",
                "border-gray-200 focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10",
              )}
              aria-label="Version corrigée du témoignage"
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500">
                {hasCorrection
                  ? `Dernière correction ${
                      testimony.editedAt
                        ? new Date(testimony.editedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : ""
                    }`
                  : "Aucune correction enregistrée"}
              </span>
              <span
                className={cn(
                  "tabular-nums text-gray-400",
                  draft.length >= MAX_CONTENT_LENGTH && "font-semibold text-red-500",
                )}
              >
                {draft.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {hasCorrection && (
              <Button
                type="button"
                variant="ghost"
                onClick={restoreOriginal}
                loading={saving}
                className="text-amber-700 hover:bg-amber-50"
              >
                Restaurer l&apos;original
              </Button>
            )}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={save}
              loading={saving}
              disabled={!hasChanges}
              className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
            >
              Enregistrer la correction
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
