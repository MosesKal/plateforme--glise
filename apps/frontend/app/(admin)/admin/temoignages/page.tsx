"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { TestimoniesTable } from "@/components/features/admin/testimonies/TestimoniesTable"
import {
  useAdminTestimonies,
  useUpdateTestimonyStatus,
  useDeleteTestimony,
} from "@/hooks/admin/useAdminTestimonies"

const FILTERS = [
  { value: "all",      label: "Tous"        },
  { value: "PENDING",  label: "En attente"  },
  { value: "APPROVED", label: "Approuvés"   },
  { value: "REJECTED", label: "Rejetés"     },
]

export default function AdminTemoignagesPage() {
  const [statusFilter, setStatusFilter] = useState("all")

  const { data, isLoading, isError } = useAdminTestimonies(
    statusFilter === "all" ? undefined : statusFilter,
  )
  const testimonies = data?.items ?? []

  const updateStatus = useUpdateTestimonyStatus()
  const deleteTest   = useDeleteTestimony()

  const pending  = testimonies.filter((t) => t.status === "PENDING").length
  const approved = testimonies.filter((t) => t.status === "APPROVED").length
  const rejected = testimonies.filter((t) => t.status === "REJECTED").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Témoignages"
        subtitle="Modération des témoignages soumis par les membres"
      />

      <div className="flex gap-4">
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

      <div className="flex gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3">
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
          onApprove={(id) => updateStatus.mutate({ id, status: "APPROVED" })}
          onReject={(id)  => updateStatus.mutate({ id, status: "REJECTED" })}
          onDelete={(id)  => deleteTest.mutate(id)}
        />
      )}
    </div>
  )
}
