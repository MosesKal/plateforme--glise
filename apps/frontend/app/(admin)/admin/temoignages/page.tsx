"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { TestimonyReviewModal } from "@/components/features/admin/testimonies/TestimonyReviewModal"
import { TestimoniesTable } from "@/components/features/admin/testimonies/TestimoniesTable"
import {
  useAdminTestimonies,
  useUpdateTestimonyContent,
  useUpdateTestimonyStatus,
  useDeleteTestimony,
} from "@/hooks/admin/useAdminTestimonies"
import type { AdminTestimony } from "@/lib/api/admin/testimonies"

const FILTERS = [
  { value: "all",      label: "Tous"        },
  { value: "PENDING",  label: "En attente"  },
  { value: "APPROVED", label: "Approuvés"   },
  { value: "REJECTED", label: "Rejetés"     },
]

export default function AdminTemoignagesPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviewTarget, setReviewTarget] = useState<AdminTestimony | null>(null)

  const { data, isLoading, isError } = useAdminTestimonies(
    statusFilter === "all" ? undefined : statusFilter,
  )
  const testimonies = data?.items ?? []

  const updateStatus = useUpdateTestimonyStatus()
  const updateContent = useUpdateTestimonyContent()
  const deleteTest   = useDeleteTestimony()

  const saveContent = async (editedContent: string | null) => {
    if (!reviewTarget) return
    try {
      await updateContent.mutateAsync({
        id: reviewTarget.id,
        editedContent,
      })
      setReviewTarget(null)
    } catch {
      // Le MutationCache global affiche l'erreur et la modale reste ouverte.
    }
  }

  const pending  = testimonies.filter((t) => t.status === "PENDING").length
  const approved = testimonies.filter((t) => t.status === "APPROVED").length
  const rejected = testimonies.filter((t) => t.status === "REJECTED").length

  return (
    <>
      {reviewTarget && (
        <TestimonyReviewModal
          key={`${reviewTarget.id}-${reviewTarget.updatedAt}`}
          testimony={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSave={saveContent}
          saving={updateContent.isPending}
        />
      )}

      <div className="space-y-6">
        <PageHeader
          title="Témoignages"
          subtitle="Modération des témoignages soumis par les membres"
        />

        <div className="flex flex-wrap gap-4">
          {[
            { label: "Total",       value: data?.total ?? 0, color: "text-gray-900"   },
            { label: "En attente",  value: pending,           color: "text-amber-600"  },
            { label: "Approuvés",   value: approved,          color: "text-green-600"  },
            { label: "Rejetés",     value: rejected,          color: "text-red-500"    },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3">
          {FILTERS.map(({ value, label }) => (
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
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : (
          <TestimoniesTable
            testimonies={testimonies}
            onReview={setReviewTarget}
            onApprove={(id) => updateStatus.mutate({ id, status: "APPROVED" })}
            onReject={(id)  => updateStatus.mutate({ id, status: "REJECTED" })}
            onDelete={(id)  => deleteTest.mutate(id)}
          />
        )}
      </div>
    </>
  )
}
