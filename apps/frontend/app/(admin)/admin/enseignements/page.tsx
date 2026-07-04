"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { useDebounce } from "@/hooks/useDebounce"
import { ADMIN_ROUTES } from "@/constants/routes"
import { AudioTeachingFormModal } from "@/components/features/admin/teachings/AudioTeachingFormModal"
import { formatDuration, formatFileSize } from "@/components/features/teachings/format"
import {
  useAdminAudioTeachings,
  useAdminSpeakers,
  useAdminThemes,
  useCreateAudioTeaching,
  useDeleteAudioTeaching,
  useReorderAudioTeachings,
  useTeachingsStats,
  useUpdateAudioTeaching,
} from "@/hooks/admin/useAdminTeachings"
import type {
  AdminAudioTeaching,
  AudioProcessingStatus,
  AudioTeachingPayload,
  TeachingStatus,
} from "@/lib/api/admin/teachings"

const STATUS_LABELS: Record<TeachingStatus, { label: string; cls: string }> = {
  PUBLISHED: { label: "Publié",    cls: "bg-green-100 text-green-700" },
  DRAFT:     { label: "Brouillon", cls: "bg-amber-100 text-amber-700" },
  ARCHIVED:  { label: "Archivé",   cls: "bg-gray-100 text-gray-500"   },
}

/** READY est l'état nominal : pas de badge. FAILED sert quand même l'original. */
const PROCESSING_LABELS: Record<
  AudioProcessingStatus,
  { label: string; title: string; cls: string } | null
> = {
  READY: null,
  PENDING: {
    label: "Optimisation en attente",
    title: "Le fichier sera compressé en AAC 96 kbps ; il est déjà écoutable.",
    cls: "bg-blue-50 text-blue-600",
  },
  PROCESSING: {
    label: "Optimisation en cours…",
    title: "Compression AAC 96 kbps en cours ; le fichier reste écoutable.",
    cls: "bg-blue-50 text-blue-600 animate-pulse",
  },
  FAILED: {
    label: "Non optimisé",
    title: "Le transcodage a échoué : le fichier original est conservé et reste écoutable. Ré-uploadez le fichier pour réessayer.",
    cls: "bg-orange-50 text-orange-600",
  },
}

/** "3 h 24 min" à partir de secondes (durée cumulée de la bibliothèque). */
function formatTotalDuration(totalSec: number): string {
  if (!totalSec) return "0 min"
  const h = Math.floor(totalSec / 3600)
  const m = Math.round((totalSec % 3600) / 60)
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`
}

export default function AdminEnseignementsPage() {
  const [themeId, setThemeId] = useState("")
  const [status, setStatus] = useState<TeachingStatus | "">("")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { data: themes = [] } = useAdminThemes()
  const { data: speakers = [] } = useAdminSpeakers()
  const { data, isLoading, isError } = useAdminAudioTeachings({
    themeId: themeId || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    limit: 100,
  })

  const { data: stats } = useTeachingsStats()

  const create = useCreateAudioTeaching()
  const update = useUpdateAudioTeaching()
  const remove = useDeleteAudioTeaching()
  const reorder = useReorderAudioTeachings()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminAudioTeaching | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminAudioTeaching | null>(null)

  const items = useMemo(() => data?.items ?? [], [data])

  const storagePercent = stats
    ? Math.min((stats.storageUsedBytes / stats.storageBudgetBytes) * 100, 100)
    : 0
  const storageBudgetGb = stats
    ? Math.round(stats.storageBudgetBytes / 1024 ** 3)
    : 100

  // Le réordonnancement n'a de sens qu'à l'intérieur d'un thème.
  const canReorder = Boolean(themeId) && !debouncedSearch && !status

  const handleSubmit = async (payload: AudioTeachingPayload) => {
    if (editTarget) {
      await update.mutateAsync({ id: editTarget.id, payload })
    } else {
      await create.mutateAsync(payload)
    }
    setModalOpen(false)
    setEditTarget(null)
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    reorder.mutate([
      { id: items[index].id, position: items[target].position },
      { id: items[target].id, position: items[index].position },
    ])
  }

  return (
    <>
      <AudioTeachingFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSubmit={handleSubmit}
        initialData={editTarget}
        themes={themes}
        speakers={speakers}
      />

      <div className="space-y-6">
        <PageHeader
          title="Enseignements audio"
          subtitle="Bibliothèque des enseignements de la C.E.C.J.C."
          action={
            <div className="flex gap-2">
              <Link
                href={`${ADMIN_ROUTES.enseignements}/videos`}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
              >
                Vidéos
              </Link>
              <Link
                href={`${ADMIN_ROUTES.enseignements}/themes`}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
              >
                Thèmes & orateurs
              </Link>
              <Button
                onClick={() => { setEditTarget(null); setModalOpen(true) }}
                className="bg-cecj-green hover:bg-cecj-green/90"
              >
                + Ajouter un enseignement
              </Button>
            </div>
          }
        />

        {/* Stats globales du module */}
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Enseignements", value: stats?.total ?? "…",      color: "text-gray-900"   },
            { label: "Publiés",       value: stats?.published ?? "…",  color: "text-green-600"  },
            { label: "Brouillons",    value: stats?.draft ?? "…",      color: "text-amber-600"  },
            { label: "Écoutes",       value: stats?.totalPlays ?? "…", color: "text-cecj-green" },
            { label: "Durée totale",  value: stats ? formatTotalDuration(stats.totalDurationSec) : "…", color: "text-gray-900" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Stockage + top écoutes */}
        {stats && (
          <div className={`grid gap-4 ${stats.topTeachings.length > 0 ? "lg:grid-cols-2" : ""}`}>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Stockage audio
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {formatFileSize(stats.storageUsedBytes)}
                  <span className="font-normal text-gray-400"> / {storageBudgetGb} Go</span>
                </p>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    storagePercent > 85
                      ? "bg-red-500"
                      : storagePercent > 65
                        ? "bg-amber-400"
                        : "bg-cecj-green"
                  }`}
                  style={{ width: `${Math.max(storagePercent, 0.5)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {storagePercent < 0.1
                  ? "Moins de 0,1 % du budget utilisé"
                  : `${storagePercent.toFixed(1).replace(".", ",")} % du budget utilisé`}
                {storagePercent > 85 && " — envisagez la migration vers un stockage objet (R2)"}
              </p>
            </div>

            {stats.topTeachings.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Les plus écoutés
                </p>
                <div className="mt-3 space-y-2">
                  {stats.topTeachings.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="w-4 shrink-0 text-center text-xs font-bold text-gray-300">
                        {i + 1}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                        {t.title}
                      </p>
                      <span className="shrink-0 text-xs tabular-nums text-gray-400">
                        {t.playCount} écoute{t.playCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green"
          >
            <option value="">Tous les thèmes</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.nameFr}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TeachingStatus | "")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green"
          >
            <option value="">Tous les statuts</option>
            <option value="PUBLISHED">Publiés</option>
            <option value="DRAFT">Brouillons</option>
            <option value="ARCHIVED">Archivés</option>
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un titre…"
            className="min-w-52 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green"
          />
        </div>

        {canReorder && (
          <p className="text-xs text-gray-400">
            Utilisez les flèches pour réorganiser l&apos;ordre d&apos;écoute dans ce thème.
          </p>
        )}

        {/* Liste */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors du chargement. Vérifiez que le backend est démarré et que vous êtes connecté.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">
              {themes.length === 0 || speakers.length === 0
                ? "Commencez par créer un thème et un orateur (bouton « Thèmes & orateurs »)."
                : "Aucun enseignement. Ajoutez le premier."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((teaching, index) => {
              const statusInfo = STATUS_LABELS[teaching.status]
              const processingInfo = teaching.fileKey
                ? PROCESSING_LABELS[teaching.processing]
                : null
              return (
                <div
                  key={teaching.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4"
                >
                  {canReorder && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0 || reorder.isPending}
                        aria-label="Monter"
                        className="text-gray-300 transition hover:text-cecj-green disabled:opacity-30"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1 || reorder.isPending}
                        aria-label="Descendre"
                        className="text-gray-300 transition hover:text-cecj-green disabled:opacity-30"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{teaching.title}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                      {processingInfo && (
                        <span
                          title={processingInfo.title}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${processingInfo.cls}`}
                        >
                          {processingInfo.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {teaching.theme.nameFr} · {teaching.speaker.fullName}
                      {" · "}{formatDuration(teaching.durationSec)}
                      {" · "}{formatFileSize(teaching.fileSize)}
                      {teaching.playCount > 0 && ` · ${teaching.playCount} écoute${teaching.playCount > 1 ? "s" : ""}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {deleteTarget?.id === teaching.id ? (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                        <span className="text-xs text-red-700">Supprimer ?</span>
                        <button
                          onClick={() => { remove.mutate(teaching.id); setDeleteTarget(null) }}
                          className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Oui
                        </button>
                        <button
                          onClick={() => setDeleteTarget(null)}
                          className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditTarget(teaching); setModalOpen(true) }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteTarget(teaching)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
