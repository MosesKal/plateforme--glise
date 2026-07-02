"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAdminContact, useMarkContactRead, useDeleteContact, type ContactMessage } from "@/hooks/admin/useAdminContact"

type StatusFilter = "all" | "UNREAD" | "READ"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all",    label: "Tous"    },
  { value: "UNREAD", label: "Non lus" },
  { value: "READ",   label: "Lus"     },
]

function StatusBadge({ status }: { status: ContactMessage["status"] }) {
  if (status === "UNREAD") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Non lu
      </span>
    )
  }
  if (status === "REPLIED") {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
        Répondu
      </span>
    )
  }
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
      Lu
    </span>
  )
}

function MessageRow({
  msg,
  onMarkRead,
  onDelete,
  expanded,
  onToggle,
}: {
  msg: ContactMessage
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  expanded: boolean
  onToggle: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className={`rounded-xl border transition-colors ${
        msg.status === "UNREAD"
          ? "border-amber-200 bg-amber-50/40"
          : "border-gray-100 bg-white"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cecj-green/10 text-sm font-bold text-cecj-green">
          {msg.firstName[0]}{msg.lastName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">
              {msg.firstName} {msg.lastName}
            </span>
            {msg.email && (
              <span className="text-xs text-gray-400">{msg.email}</span>
            )}
            {msg.phone && (
              <span className="text-xs text-gray-400">{msg.phone}</span>
            )}
            <StatusBadge status={msg.status} />
          </div>
          <p className="mt-0.5 text-sm font-medium text-gray-700 truncate">
            {msg.subject || <span className="italic text-gray-400">Sans sujet</span>}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <svg
          className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {msg.message || <span className="italic text-gray-400">Aucun message</span>}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            {confirming ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
                <span className="text-sm text-red-700">Supprimer ce message ?</span>
                <button
                  onClick={() => { onDelete(msg.id); setConfirming(false) }}
                  className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            )}
            {msg.status === "UNREAD" && !confirming && (
              <button
                onClick={() => onMarkRead(msg.id)}
                className="rounded-lg bg-cecj-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-cecj-green/90"
              >
                Marquer comme lu
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminContactPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: messages = [], isLoading, isError } = useAdminContact()
  const markRead = useMarkContactRead()
  const deleteContact = useDeleteContact()

  const filtered = statusFilter === "all"
    ? messages
    : messages.filter((m) => m.status === statusFilter)

  const unread  = messages.filter((m) => m.status === "UNREAD").length
  const read    = messages.filter((m) => m.status === "READ").length
  const replied = messages.filter((m) => m.status === "REPLIED").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages de contact"
        subtitle="Messages reçus via le formulaire de contact du site"
      />

      <div className="flex gap-4">
        {[
          { label: "Total",    value: messages.length, color: "text-gray-900"  },
          { label: "Non lus",  value: unread,           color: "text-amber-600" },
          { label: "Lus",      value: read,             color: "text-green-600" },
          { label: "Répondus", value: replied,           color: "text-blue-600"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3">
        {STATUS_FILTERS.map(({ value, label }) => (
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
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">Aucun message {statusFilter !== "all" ? "dans cette catégorie" : "reçu"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => deleteContact.mutate(id)}
              expanded={expandedId === msg.id}
              onToggle={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
