"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { adminSermonsApi, type AdminSermon, type SermonCategory } from "@/lib/api/admin/sermons"
import { stagger, fadeUp, inView } from "@/lib/motion"

function MediaIcon({ type }: { type: "video" | "audio" | "pdf" }) {
  const icons = {
    video: { d: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z", color: "text-red-500" },
    audio: { d: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z", color: "text-blue-500" },
    pdf:   { d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "text-amber-500" },
  }
  const { d, color } = icons[type]
  return (
    <svg className={cn("h-4 w-4", color)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function SermonCard({ sermon }: { sermon: AdminSermon }) {
  return (
    <motion.article variants={fadeUp} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {sermon.coverImage ? (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sermon.coverImage}
            alt={sermon.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-cecj-green to-cecj-green/70">
          <svg className="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        {sermon.category && (
          <span className="w-fit rounded-full bg-cecj-green/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cecj-green">
            {sermon.category.name}
          </span>
        )}
        <h3 className="font-bold leading-snug text-gray-900 line-clamp-2">{sermon.title}</h3>
        <p className="text-sm text-gray-500">{sermon.speaker}</p>
        {sermon.description && (
          <p className="text-xs text-gray-400 line-clamp-2">{sermon.description}</p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2">
          {sermon.videoUrl && (
            <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors">
              <MediaIcon type="video" /> Vidéo
            </a>
          )}
          {sermon.audioUrl && (
            <a href={sermon.audioUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors">
              <MediaIcon type="audio" /> Audio
            </a>
          )}
          {sermon.pdfUrl && (
            <a href={sermon.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-amber-500 transition-colors">
              <MediaIcon type="pdf" /> PDF
            </a>
          )}
          {sermon.publishedAt && (
            <span className="ml-auto text-[11px] text-gray-300">
              {new Date(sermon.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="h-44 bg-gray-100" />
      <div className="flex flex-col gap-2 p-5">
        <div className="h-3 w-20 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-3 w-32 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export function EnseignementsContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: categories = [] } = useQuery<SermonCategory[]>({
    queryKey: ["public", "sermons", "categories"],
    queryFn: adminSermonsApi.listCategories,
  })

  const { data: sermonsData, isLoading } = useQuery({
    queryKey: ["public", "sermons", selectedCategory],
    queryFn: () => adminSermonsApi.list({
      status: "published",
      categoryId: selectedCategory ?? undefined,
      limit: 50,
    }),
  })

  const sermons = sermonsData?.items ?? []

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span variants={fadeUp} className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
              La Parole de Dieu
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              Enseignements
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-xl text-lg text-white/70">
              Sermons, messages et enseignements bibliques de la C.E.C.J.
            </motion.p>
            <motion.div variants={fadeUp} className="flex justify-center gap-8 pt-2">
              <div className="text-center">
                <p className="text-3xl font-bold text-cecj-gold">{sermonsData?.total ?? "—"}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Enseignements</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-cecj-gold">{categories.length}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Catégories</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filtres par catégorie */}
      {categories.length > 0 && (
        <div className="sticky top-[64px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 lg:px-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                selectedCategory === null ? "bg-cecj-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  selectedCategory === cat.id ? "bg-cecj-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grille */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : sermons.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">Aucun enseignement disponible pour le moment.</p>
          </div>
        ) : (
          <motion.div {...inView()} variants={stagger} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
