"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useDebounce } from "@/hooks/useDebounce"
import { useTeachingThemes, useVideoTeachings } from "@/hooks/useTeachings"
import { VideoCard } from "./VideoCard"

const PAGE_SIZE = 12

function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-video animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

export function VideosContent() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "fr"

  const [search, setSearch] = useState("")
  const [themeSlug, setThemeSlug] = useState("")
  // « Charger plus » : la limite grandit, React Query met les pages en cache.
  const [limit, setLimit] = useState(PAGE_SIZE)
  const debouncedSearch = useDebounce(search.trim(), 300)

  const { data: themes = [] } = useTeachingThemes()
  const { data, isLoading } = useVideoTeachings({
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    themeSlug: themeSlug || undefined,
    limit,
  })

  const items = data?.items ?? []
  const hasMore = (data?.total ?? 0) > items.length
  const themesWithVideos = themes.filter((t) => t.isActive)

  const changeFilter = (fn: () => void) => {
    setLimit(PAGE_SIZE)
    fn()
  }

  return (
    <div className="bg-white pb-24">
      {/* Hero + recherche */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cecj-gold"
            >
              La Parole en images
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              Enseignements vidéo
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-lg text-white/70 leading-relaxed"
            >
              Regardez les prédications et enseignements de la chaîne YouTube de
              l&apos;église, directement sur le site.
            </motion.p>

            <motion.div variants={fadeUp} className="mx-auto max-w-xl pt-2">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => changeFilter(() => setSearch(e.target.value))}
                  placeholder="Rechercher une vidéo…"
                  className="w-full rounded-full border border-white/15 bg-white/10 py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/40 outline-none backdrop-blur transition focus:border-cecj-gold/60 focus:bg-white/15"
                />
                {search && (
                  <button
                    onClick={() => changeFilter(() => setSearch(""))}
                    aria-label="Effacer la recherche"
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filtre par thème (seulement si l'équipe a catégorisé des vidéos) */}
      {themesWithVideos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              Thèmes
            </span>
            {themesWithVideos.map((theme) => (
              <button
                key={theme.id}
                onClick={() =>
                  changeFilter(() =>
                    setThemeSlug((current) => (current === theme.slug ? "" : theme.slug)),
                  )
                }
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  themeSlug === theme.slug
                    ? "border-cecj-green bg-cecj-green text-white"
                    : "border-gray-200 text-gray-600 hover:border-cecj-green hover:text-cecj-green"
                }`}
              >
                {theme.nameFr}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Grille de vidéos */}
      <section className="mx-auto max-w-6xl px-4 pt-10 lg:px-8">
        {isLoading ? (
          <CardSkeleton />
        ) : items.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">
              {debouncedSearch || themeSlug
                ? "Aucune vidéo ne correspond à votre recherche."
                : "Les vidéos arrivent bientôt."}
            </p>
            <Link
              href={`/${locale}/enseignements`}
              className="inline-block text-sm font-semibold text-cecj-green hover:underline"
            >
              Écouter les enseignements audio →
            </Link>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((video) => (
              <motion.div key={video.id} variants={fadeUp}>
                <VideoCard video={video} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {hasMore && (
          <div className="pt-10 text-center">
            <button
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
              className="rounded-full border border-cecj-green px-6 py-2.5 text-sm font-semibold text-cecj-green transition hover:bg-cecj-green hover:text-white"
            >
              Charger plus de vidéos
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
