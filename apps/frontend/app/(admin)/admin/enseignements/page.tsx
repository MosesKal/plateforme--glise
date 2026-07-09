"use client"

import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { ADMIN_ROUTES } from "@/constants/routes"
import { formatFileSize } from "@/components/features/teachings/format"
import {
  useAdminSpeakers,
  useAdminThemes,
  useAdminVideoTeachings,
  useTeachingsStats,
} from "@/hooks/admin/useAdminTeachings"

const ICONS = {
  audio:    "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
  video:    "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  document: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  tags:     "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z",
}

/** "3 h 24 min" à partir de secondes (durée cumulée de la bibliothèque). */
function formatTotalDuration(totalSec: number): string {
  if (!totalSec) return "0 min"
  const h = Math.floor(totalSec / 3600)
  const m = Math.round((totalSec % 3600) / 60)
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`
}

function ModuleCard({
  title,
  value,
  sub,
  href,
  iconPath,
  cta = "Gérer",
  soon,
  loading,
}: {
  title: string
  value: number | string
  sub?: string
  href: string
  iconPath: string
  cta?: string
  soon?: boolean
  loading?: boolean
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-cecj-green/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cecj-green/8 text-cecj-green transition group-hover:bg-cecj-green group-hover:text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        {soon && (
          <span className="rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-600">
            À venir
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-900">{title}</p>
      {loading ? (
        <div className="mt-1 h-8 w-16 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
      {sub && <p className="mt-0.5 flex-1 text-xs text-gray-400">{sub}</p>}
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cecj-green">
        {cta}
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  )
}

/** Vue d'ensemble du module Enseignements : chaque format se gère sur sa page dédiée. */
export default function AdminEnseignementsPage() {
  const { data: stats, isLoading: loadingStats } = useTeachingsStats()
  // limit: 1 — seul le total nous intéresse ici.
  const { data: videosData, isLoading: loadingVideos } = useAdminVideoTeachings({ limit: 1 })
  const { data: themes = [], isLoading: loadingThemes } = useAdminThemes()
  const { data: speakers = [] } = useAdminSpeakers()

  const storagePercent = stats
    ? Math.min((stats.storageUsedBytes / stats.storageBudgetBytes) * 100, 100)
    : 0
  const storageBudgetGb = stats
    ? Math.round(stats.storageBudgetBytes / 1024 ** 3)
    : 100

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enseignements"
        subtitle="Vue d'ensemble du module — audio, vidéo et écrits"
      />

      {/* Un format = une page de gestion dédiée */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModuleCard
          title="Audios"
          value={stats?.total ?? 0}
          sub={
            stats
              ? `${stats.published} publié${stats.published > 1 ? "s" : ""}${stats.draft > 0 ? ` · ${stats.draft} brouillon${stats.draft > 1 ? "s" : ""}` : ""} · ${formatTotalDuration(stats.totalDurationSec)}`
              : undefined
          }
          href={ADMIN_ROUTES.enseignementsAudios}
          iconPath={ICONS.audio}
          loading={loadingStats}
        />
        <ModuleCard
          title="Vidéos"
          value={videosData?.total ?? 0}
          sub="Miroir de la chaîne YouTube"
          href={ADMIN_ROUTES.enseignementsVideos}
          iconPath={ICONS.video}
          loading={loadingVideos}
        />
        <ModuleCard
          title="Écrits (PDF)"
          value="—"
          sub="Module en préparation"
          href={ADMIN_ROUTES.enseignementsEcrits}
          iconPath={ICONS.document}
          cta="Voir"
          soon
        />
        <ModuleCard
          title="Thèmes & orateurs"
          value={themes.length}
          sub={`${speakers.length} orateur${speakers.length > 1 ? "s" : ""}`}
          href={ADMIN_ROUTES.enseignementsThemes}
          iconPath={ICONS.tags}
          loading={loadingThemes}
        />
      </div>

      {/* Stockage + top écoutes — préoccupations transverses du module */}
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
    </div>
  )
}
