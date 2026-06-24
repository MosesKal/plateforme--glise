"use client"

import type { Testimony, TestimonyStatus } from "@/lib/api/admin/testimonies"

const STATUS_STYLES: Record<TestimonyStatus, { label: string; cls: string }> = {
  PENDING:  { label: "En attente", cls: "bg-amber-50 text-amber-700"  },
  APPROVED: { label: "Approuvé",   cls: "bg-green-50 text-green-700"  },
  REJECTED: { label: "Rejeté",     cls: "bg-red-50 text-red-600"      },
}

interface Props {
  testimonies: Testimony[]
  onApprove: (id: string) => void
  onReject:  (id: string) => void
  onDelete:  (id: string) => void
}

export function TestimoniesTable({ testimonies, onApprove, onReject, onDelete }: Props) {
  if (testimonies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-400">Aucun témoignage pour ce filtre.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {testimonies.map((t) => {
        const { label, cls } = STATUS_STYLES[t.status]
        return (
          <div key={t.id} className="group rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cecj-green/10 text-sm font-bold text-cecj-green">
                  {t.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{t.fullName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600 line-clamp-3">{t.content}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {t.status !== "APPROVED" && (
                  <button
                    onClick={() => onApprove(t.id)}
                    title="Approuver"
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors"
                  >
                    ✓ Approuver
                  </button>
                )}
                {t.status !== "REJECTED" && (
                  <button
                    onClick={() => onReject(t.id)}
                    title="Rejeter"
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    ✕ Rejeter
                  </button>
                )}
                <button
                  onClick={() => onDelete(t.id)}
                  title="Supprimer"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
