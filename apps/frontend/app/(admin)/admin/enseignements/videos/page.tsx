"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Pagination } from "@/components/shared/Pagination"
import { Button } from "@/components/ui/Button"
import { useDebounce } from "@/hooks/useDebounce"
import { ADMIN_ROUTES } from "@/constants/routes"
import { formatDuration } from "@/components/features/teachings/format"
import { formatDate } from "@/lib/utils"
import { VideoTeachingFormModal } from "@/components/features/admin/teachings/VideoTeachingFormModal"
import {
  useAdminSpeakers,
  useAdminThemes,
  useAdminVideoTeachings,
  useDeleteVideoTeaching,
  useSyncVideos,
  useUpdateVideoTeaching,
  useVideoSyncStatus,
} from "@/hooks/admin/useAdminTeachings"
import type {
  AdminVideoTeaching,
  TeachingStatus,
  VideoTeachingPayload,
} from "@/lib/api/admin/teachings"

const STATUS_LABELS: Record<TeachingStatus, { label: string; cls: string }> = {
  PUBLISHED: { label: "Publié",    cls: "bg-green-100 text-green-700" },
  DRAFT:     { label: "Brouillon", cls: "bg-amber-100 text-amber-700" },
  ARCHIVED:  { label: "Archivé",   cls: "bg-gray-100 text-gray-500"   },
}

const PAGE_SIZE = 10

export default function AdminVideosPage() {
  const [status, setStatus] = useState<TeachingStatus | "">("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const changeFilter = (fn: () => void) => {
    setPage(1)
    fn()
  }

  const { data: themes = [] } = useAdminThemes()
  const { data: speakers = [] } = useAdminSpeakers()
  const { data: syncStatus } = useVideoSyncStatus()
  const { data, isLoading, isError } = useAdminVideoTeachings({
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  })

  // Recalage si la page courante disparaît (ex. vidéo retirée en fin de liste).
  if (data && page > 1 && page > data.totalPages) {
    setPage(Math.max(data.totalPages, 1))
  }

  const sync = useSyncVideos()
  const update = useUpdateVideoTeaching()
  const remove = useDeleteVideoTeaching()

  const [editTarget, setEditTarget] = useState<AdminVideoTeaching | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const items = data?.items ?? []

  const handleSync = () => {
    setSyncError(null)
    sync.mutate(undefined, {
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setSyncError(message || "La synchronisation a échoué. Réessayez.")
      },
    })
  }

  const handleUpdate = async (payload: VideoTeachingPayload) => {
    if (!editTarget) return
    await update.mutateAsync({ id: editTarget.id, payload })
    setEditTarget(null)
  }

  return (
    <>
      <VideoTeachingFormModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        video={editTarget}
        themes={themes}
        speakers={speakers}
      />

      <div className="space-y-6">
        <PageHeader
          title="Enseignements vidéo"
          subtitle="Miroir de la chaîne YouTube — catégorisez les vidéos par thème et orateur."
          action={
            <div className="flex gap-2">
              <Link
                href={ADMIN_ROUTES.enseignements}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
              >
                ← Audio
              </Link>
              <Button
                onClick={handleSync}
                loading={sync.isPending}
                disabled={syncStatus ? !syncStatus.configured : false}
                className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
              >
                Synchroniser YouTube
              </Button>
            </div>
          }
        />

        {/* État de la sync */}
        {syncStatus && !syncStatus.configured && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Synchronisation non configurée : définissez <code className="font-mono">YOUTUBE_API_KEY</code> et{" "}
            <code className="font-mono">YOUTUBE_CHANNEL_ID</code> dans le <code className="font-mono">.env</code> du backend.
          </div>
        )}
        {syncError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {syncError}
          </div>
        )}
        {sync.isSuccess && sync.data && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Synchronisation terminée : {sync.data.created} nouvelle(s), {sync.data.updated} mise(s) à jour
            {sync.data.unavailable > 0 && <>, {sync.data.unavailable} devenue(s) indisponible(s)</>}.
          </div>
        )}
        {!sync.isSuccess && syncStatus?.lastSync && (
          <p className="text-xs text-gray-400">
            Dernière synchronisation : {formatDate(syncStatus.lastSync.syncedAt)} —{" "}
            {syncStatus.lastSync.total} vidéo(s) sur la chaîne. Sync automatique toutes les 6 h.
          </p>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => changeFilter(() => setSearch(e.target.value))}
            placeholder="Rechercher un titre…"
            className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"
          />
          <select
            value={status}
            onChange={(e) => changeFilter(() => setStatus(e.target.value as TeachingStatus | ""))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green"
          >
            <option value="">Tous les statuts</option>
            <option value="PUBLISHED">Publié</option>
            <option value="DRAFT">Brouillon</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-red-100 bg-red-50 py-12 text-center text-sm text-red-500">
            Impossible de charger les vidéos.
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
            Aucune vidéo. Lancez une synchronisation pour importer la chaîne YouTube.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((video) => {
              const statusInfo = STATUS_LABELS[video.status]
              return (
                <div
                  key={video.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className={`h-16 w-28 shrink-0 rounded-lg object-cover ${!video.isAvailable ? "opacity-40 grayscale" : ""}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="line-clamp-1 font-semibold text-gray-900">{video.title}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                      {!video.isAvailable && (
                        <span
                          title="Cette vidéo n'existe plus sur YouTube (supprimée ou passée en privé). Elle est masquée du site."
                          className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600"
                        >
                          Indisponible sur YouTube
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatDate(video.publishedAt)}
                      {video.durationSec > 0 && <> · {formatDuration(video.durationSec)}</>}
                      {video.theme && <> · {video.theme.nameFr}</>}
                      {video.speaker && <> · {video.speaker.fullName}</>}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setEditTarget(video)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
                    >
                      Catégoriser
                    </button>
                    {!video.isAvailable && (
                      <button
                        onClick={() => remove.mutate(video.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            itemLabel="vidéo"
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  )
}
