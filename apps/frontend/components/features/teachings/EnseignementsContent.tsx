"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useDebounce } from "@/hooks/useDebounce"
import {
  useAudioTeachings,
  useTeachingTags,
  useTeachingThemes,
} from "@/hooks/useTeachings"
import { ThemeCard } from "@/components/features/teachings/audio/ThemeCard"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"
import { ResumeListening } from "@/components/features/teachings/audio/ResumeListening"
import type { AudioTeaching, PublicTag } from "@/lib/api/teachings"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
      <div className="h-1 w-10 rounded bg-cecj-gold" />
    </div>
  )
}

function RowList({ items }: { items: AudioTeaching[] }) {
  return (
    <div className="space-y-3">
      {items.map((teaching, index) => (
        <AudioTeachingRow key={teaching.id} teaching={teaching} queue={items} index={index} />
      ))}
    </div>
  )
}

function RowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[74px] animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}

export function EnseignementsContent() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "fr"

  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<PublicTag | null>(null)
  const debouncedSearch = useDebounce(search.trim(), 300)

  const isSearching = debouncedSearch.length >= 2
  const isBrowsing = !isSearching && !activeTag

  const { data: themes = [], isLoading: themesLoading } = useTeachingThemes()
  const { data: tags = [] } = useTeachingTags()

  // Résultats (recherche OU tag) — une seule requête active à la fois.
  const { data: results, isLoading: resultsLoading } = useAudioTeachings(
    isSearching
      ? { search: debouncedSearch, limit: 30 }
      : { tag: activeTag?.slug, limit: 30 },
    isSearching || Boolean(activeTag),
  )

  const { data: recent } = useAudioTeachings({ sort: "recent", limit: 5 }, isBrowsing)
  const { data: popular } = useAudioTeachings({ sort: "popular", limit: 5 }, isBrowsing)

  const visibleThemes = themes.filter((t) => t._count.audioTeachings > 0)
  const showPopular =
    (popular?.items.some((t) => t.playCount > 0) ?? false) && (popular?.items.length ?? 0) > 1

  const selectTag = (tag: PublicTag) => {
    setSearch("")
    setActiveTag((current) => (current?.id === tag.id ? null : tag))
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
              La Parole en tout temps
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              Enseignements
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-lg text-white/70 leading-relaxed"
            >
              Écoutez les enseignements de l&apos;église, organisés par thèmes.
              Lancez la lecture et continuez votre navigation — l&apos;écoute vous suit.
            </motion.p>

            {/* Recherche */}
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
                  onChange={(e) => { setSearch(e.target.value); setActiveTag(null) }}
                  placeholder="Rechercher un enseignement…"
                  className="w-full rounded-full border border-white/15 bg-white/10 py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/40 outline-none backdrop-blur transition focus:border-cecj-gold/60 focus:bg-white/15"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
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

      {/* Tags */}
      {tags.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              Sujets
            </span>
            {tags.slice(0, 14).map((tag) => (
              <button
                key={tag.id}
                onClick={() => selectTag(tag)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTag?.id === tag.id
                    ? "border-cecj-green bg-cecj-green text-white"
                    : "border-gray-200 text-gray-600 hover:border-cecj-green hover:text-cecj-green"
                }`}
              >
                {tag.name}
                <span className="ml-1.5 opacity-50">{tag.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Mode résultats : recherche ou tag actif */}
      {!isBrowsing ? (
        <section className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionTitle>
                {isSearching ? (
                  <>Résultats pour «&nbsp;{debouncedSearch}&nbsp;»</>
                ) : (
                  <>Sujet : {activeTag?.name}</>
                )}
              </SectionTitle>
              {!resultsLoading && (
                <p className="text-sm text-gray-400">
                  {results?.total ?? 0} enseignement{(results?.total ?? 0) > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {resultsLoading ? (
              <RowSkeleton />
            ) : (results?.items.length ?? 0) === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                Aucun enseignement trouvé. Essayez un autre mot-clé ou parcourez les thèmes.
              </p>
            ) : (
              <RowList items={results!.items} />
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Reprendre l'écoute (localStorage, propre à l'appareil) */}
          <ResumeListening />

          {/* Thèmes — contenu principal de la page. Révélé au MONTAGE
              (initial/animate) et non au scroll (whileInView) : les données
              étant chargées côté client, l'IntersectionObserver ajoutait un
              délai qui rendait l'apparition lente et saccadée. Chaque carte
              est animée individuellement (stagger) pour un rendu fluide. */}
          <section className="mx-auto max-w-6xl px-4 pt-14 lg:px-8">
            <div className="space-y-8">
              <SectionTitle>Parcourir par thème</SectionTitle>

              {themesLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : visibleThemes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                  Les enseignements arrivent bientôt.
                </p>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {visibleThemes.map((theme) => (
                    <motion.div key={theme.id} variants={fadeUp}>
                      <ThemeCard
                        theme={theme}
                        href={`/${locale}/enseignements/audio/${theme.slug}`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>

          {/* Derniers + plus écoutés */}
          {(recent?.items.length ?? 0) > 0 && (
            <section className="mx-auto max-w-6xl px-4 pt-16 lg:px-8">
              <motion.div
                {...inView()}
                variants={stagger}
                className={`grid gap-12 ${showPopular ? "lg:grid-cols-2" : ""}`}
              >
                <motion.div variants={fadeUp} className="space-y-6">
                  <SectionTitle>Derniers enseignements</SectionTitle>
                  <RowList items={recent!.items} />
                </motion.div>

                {showPopular && (
                  <motion.div variants={fadeUp} className="space-y-6">
                    <SectionTitle>Les plus écoutés</SectionTitle>
                    <RowList items={popular!.items} />
                  </motion.div>
                )}
              </motion.div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
