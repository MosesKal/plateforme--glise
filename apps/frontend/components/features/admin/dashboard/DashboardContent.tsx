"use client"

import Link from "next/link"
import { useAdminUsers } from "@/hooks/admin/useAdminUsers"
import { useAdminExtensions } from "@/hooks/admin/useAdminExtensions"
import { useAdminEvents } from "@/hooks/admin/useAdminEvents"
import { useAdminGalleryItems } from "@/hooks/admin/useAdminGallery"
import { useAdminTestimonies } from "@/hooks/admin/useAdminTestimonies"
import { useAdminContact } from "@/hooks/admin/useAdminContact"
import { useAdminVideoTeachings, useTeachingsStats } from "@/hooks/admin/useAdminTeachings"
import { useAuthStore } from "@/store/auth.store"
import { ADMIN_ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

// ── Icons ──────────────────────────────────────────────────────────────────────

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const ICONS = {
  users:      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  extensions: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  events:     "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  gallery:    "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  testimony:  "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
  mail:       "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  audio:      "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
  video:      "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  document:   "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  arrow:      "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  clock:      "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  check:      "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
}

// ── Stat card ──────────────────────────────────────────────────────────────────

interface StatProps {
  label: string
  value: number | string
  sub?: string
  iconPath: string
  href: string
  accent?: "gold" | "red" | "green" | "default"
  loading?: boolean
}

function StatCard({ label, value, sub, iconPath, href, accent = "default", loading }: StatProps) {
  const colors = {
    default: { bg: "bg-white", icon: "bg-cecj-green/8 text-cecj-green", value: "text-gray-900" },
    gold:    { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", value: "text-amber-700" },
    red:     { bg: "bg-red-50",   icon: "bg-red-100 text-red-500",     value: "text-red-600"   },
    green:   { bg: "bg-green-50", icon: "bg-green-100 text-green-600", value: "text-green-700" },
  }
  const c = colors[accent]

  return (
    <Link href={href} className={cn("group flex items-center gap-4 rounded-xl p-5 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md", c.bg)}>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", c.icon)}>
        <Icon d={iconPath} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className={cn("text-2xl font-bold leading-tight", c.value)}>{value}</p>
        )}
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
      <Icon d={ICONS.arrow} className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-cecj-green" />
    </Link>
  )
}

// ── Activity card ──────────────────────────────────────────────────────────────

function ActivityCard({ title, count, href, linkLabel, children }: {
  title: string
  count?: number
  href: string
  linkLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
          {count !== undefined && count > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cecj-green px-1.5 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </h3>
        <Link href={href} className="text-xs font-medium text-cecj-green hover:underline">{linkLabel} →</Link>
      </div>
      <div className="flex-1 divide-y divide-gray-50">{children}</div>
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <p className="px-5 py-8 text-center text-sm text-gray-400">{label}</p>
}

// ── Date helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function greeting() {
  const h = new Date().getHours()
  return h < 18 ? "Bonjour" : "Bonsoir"
}

function todayLabel() {
  return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export function DashboardContent() {
  const { user } = useAuthStore()

  const { data: users = [],      isLoading: loadingUsers }   = useAdminUsers()
  const { data: extensions = [], isLoading: loadingExt }     = useAdminExtensions()
  const { data: events = [],     isLoading: loadingEvents }  = useAdminEvents()
  const { data: galleryData,     isLoading: loadingGallery } = useAdminGalleryItems()
  const { data: pendingData,     isLoading: loadingPending } = useAdminTestimonies("PENDING")
  const { data: messages = [],   isLoading: loadingMsgs }    = useAdminContact()
  const { data: teachingsStats,  isLoading: loadingTeach }   = useTeachingsStats()
  // limit: 1 — seul le total nous intéresse pour la carte du dashboard.
  const { data: videosData,      isLoading: loadingVideos }  = useAdminVideoTeachings({ limit: 1 })

  // Derived
  const activeUsers      = users.filter((u) => u.status === "ACTIVE").length
  const activeExtensions = extensions.filter((e) => e.status === "ACTIVE").length
  const publishedEvents  = events.filter((e) => e.status === "PUBLISHED").length
  const totalPhotos      = galleryData?.total ?? 0
  const pendingCount     = pendingData?.total ?? 0
  const pendingList      = (pendingData?.items ?? []).slice(0, 4)
  const unreadMessages   = messages.filter((m) => m.status === "UNREAD")
  const unreadCount      = unreadMessages.length
  const recentUnread     = unreadMessages.slice(0, 4)
  const upcomingEvents   = events
    .filter((e) => e.status === "PUBLISHED" && new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-8">
      {/* ── Greeting ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}{user ? `, ${user.firstName}` : ""} 👋
          </h1>
          <p className="mt-0.5 text-sm capitalize text-gray-400">{todayLabel()}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Plateforme active
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Utilisateurs actifs"
          value={activeUsers}
          sub={`${users.length} comptes au total`}
          iconPath={ICONS.users}
          href={ADMIN_ROUTES.utilisateurs}
          loading={loadingUsers}
        />
        <StatCard
          label="Extensions actives"
          value={activeExtensions}
          sub={`${extensions.length} au total`}
          iconPath={ICONS.extensions}
          href={ADMIN_ROUTES.extensions}
          loading={loadingExt}
        />
        <StatCard
          label="Événements publiés"
          value={publishedEvents}
          sub={`${upcomingEvents.length} à venir`}
          iconPath={ICONS.events}
          href={ADMIN_ROUTES.evenements}
          loading={loadingEvents}
        />
        <StatCard
          label="Photos en galerie"
          value={totalPhotos}
          iconPath={ICONS.gallery}
          href={ADMIN_ROUTES.galerie}
          loading={loadingGallery}
        />
        <StatCard
          label="Enseignements audio"
          value={teachingsStats?.published ?? 0}
          sub={
            teachingsStats
              ? `${teachingsStats.totalPlays} écoute${teachingsStats.totalPlays > 1 ? "s" : ""} cumulée${teachingsStats.totalPlays > 1 ? "s" : ""}${teachingsStats.draft > 0 ? ` · ${teachingsStats.draft} brouillon${teachingsStats.draft > 1 ? "s" : ""}` : ""}`
              : undefined
          }
          iconPath={ICONS.audio}
          href={ADMIN_ROUTES.enseignementsAudios}
          accent={teachingsStats && teachingsStats.draft > 0 ? "gold" : "default"}
          loading={loadingTeach}
        />
        <StatCard
          label="Enseignements vidéo"
          value={videosData?.total ?? 0}
          sub="Miroir de la chaîne YouTube"
          iconPath={ICONS.video}
          href={ADMIN_ROUTES.enseignementsVideos}
          loading={loadingVideos}
        />
        <StatCard
          label="Enseignements écrits"
          value="—"
          sub="Module PDF à venir"
          iconPath={ICONS.document}
          href={ADMIN_ROUTES.enseignementsEcrits}
        />
        <StatCard
          label="Témoignages en attente"
          value={pendingCount}
          iconPath={ICONS.testimony}
          href={ADMIN_ROUTES.temoignages}
          accent={pendingCount > 0 ? "gold" : "default"}
          loading={loadingPending}
        />
        <StatCard
          label="Messages non lus"
          value={unreadCount}
          iconPath={ICONS.mail}
          href={ADMIN_ROUTES.contact}
          accent={unreadCount > 0 ? "red" : "default"}
          loading={loadingMsgs}
        />
      </div>

      {/* ── Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Prochains événements */}
        <ActivityCard
          title="Prochains événements"
          count={upcomingEvents.length}
          href={ADMIN_ROUTES.evenements}
          linkLabel="Gérer"
        >
          {upcomingEvents.length === 0 ? (
            <EmptyRow label="Aucun événement à venir" />
          ) : upcomingEvents.map((e) => (
            <div key={e.id} className="flex items-start gap-3 px-5 py-3">
              <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-cecj-green/8 text-cecj-green">
                <span className="text-xs font-bold leading-none">
                  {new Date(e.startDate).toLocaleDateString("fr-FR", { day: "2-digit" })}
                </span>
                <span className="text-[10px] uppercase leading-none opacity-70">
                  {new Date(e.startDate).toLocaleDateString("fr-FR", { month: "short" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{e.titleFr}</p>
                {e.location && <p className="truncate text-xs text-gray-400">{e.location}</p>}
              </div>
            </div>
          ))}
        </ActivityCard>

        {/* Témoignages en attente */}
        <ActivityCard
          title="Témoignages en attente"
          count={pendingCount}
          href={ADMIN_ROUTES.temoignages}
          linkLabel="Modérer"
        >
          {pendingList.length === 0 ? (
            <EmptyRow label="Aucun témoignage en attente" />
          ) : pendingList.map((t) => (
            <div key={t.id} className="flex items-start gap-3 px-5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                {t.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{t.fullName}</p>
                <p className="line-clamp-1 text-xs text-gray-400">{t.content}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-300">{formatDate(t.createdAt)}</span>
            </div>
          ))}
        </ActivityCard>

        {/* Messages non lus */}
        <ActivityCard
          title="Messages non lus"
          count={unreadCount}
          href={ADMIN_ROUTES.contact}
          linkLabel="Voir tout"
        >
          {recentUnread.length === 0 ? (
            <EmptyRow label="Aucun message non lu" />
          ) : recentUnread.map((m) => (
            <div key={m.id} className="flex items-start gap-3 px-5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-500">
                {m.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {m.firstName} {m.lastName}
                </p>
                <p className="truncate text-xs text-gray-400">{m.subject}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-300">{formatDate(m.createdAt)}</span>
            </div>
          ))}
        </ActivityCard>

      </div>
    </div>
  )
}
