"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { useDebounce } from "@/hooks/useDebounce"
import {
  useAudioTeachings,
  useInfiniteAudioTeachings,
  useTeachingTags,
  useTeachingThemes,
  useVideoTeachings,
} from "@/hooks/useTeachings"
import { LoadMoreButton } from "@/components/shared/LoadMoreButton"
import { FeaturedTeachingHero } from "@/components/features/teachings/audio/FeaturedTeachingHero"
import { ThemeCard } from "@/components/features/teachings/audio/ThemeCard"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"
import { ResumeListening } from "@/components/features/teachings/audio/ResumeListening"
import { VideoCard } from "@/components/features/teachings/video/VideoCard"
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
  const { t, locale } = useI18n()

  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<PublicTag | null>(null)
  const debouncedSearch = useDebounce(search.trim(), 300)

  const isSearching = debouncedSearch.length >= 2
  const isBrowsing = !isSearching && !activeTag

  const { data: themes = [], isLoading: themesLoading } = useTeachingThemes()
  const { data: tags = [] } = useTeachingTags()

  // Résultats (recherche OU tag) — une seule requête active à la fois,
  // en chargement progressif (un tag peut couvrir un thème de 200+ audios).
  const {
    data: results,
    isLoading: resultsLoading,
    fetchNextPage: fetchMoreResults,
    isFetchingNextPage: isFetchingMoreResults,
  } = useInfiniteAudioTeachings(
    isSearching
      ? { search: debouncedSearch, limit: 10 }
      : { tag: activeTag?.slug, limit: 10 },
    isSearching || Boolean(activeTag),
  )

  const resultItems = useMemo(
    () => results?.pages.flatMap((p) => p.items) ?? [],
    [results],
  )
  const resultsTotal = results?.pages[0]?.total ?? 0

  const { data: recent } = useAudioTeachings({ sort: "recent", limit: 5 }, isBrowsing)
  const { data: popular } = useAudioTeachings({ sort: "popular", limit: 5 }, isBrowsing)
  const { data: videos } = useVideoTeachings({ limit: 3 }, isBrowsing)

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
      <section className="relative overflow-hidden bg-cecj-green py-14 md:py-24">
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
              {t("teachings.hub.badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              {t("teachings.hub.title")}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-base text-white/70 leading-relaxed md:text-lg"
            >
              {t("teachings.hub.intro")}
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
                  placeholder={t("teachings.hub.searchPlaceholder")}
                  className="w-full rounded-full border border-white/15 bg-white/10 py-3.5 pl-12 pr-12 text-base text-white placeholder:text-white/40 outline-none backdrop-blur transition focus:border-cecj-gold/60 focus:bg-white/15 sm:text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label={t("teachings.common.clearSearch")}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Dernier enseignement, jouable immédiatement : le visiteur peut
                lancer l'écoute sans traverser thème puis page détail. */}
            <motion.div variants={fadeUp} className="mx-auto max-w-xl pt-3">
              <FeaturedTeachingHero />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tags — rangée défilante en mobile (le wrap de ~14 boutons repousse
          le contenu trop bas), wrap classique dès sm. */}
      {tags.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8 lg:px-8">
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-widest text-gray-400">
              {t("teachings.hub.topics")}
            </span>
            {tags.slice(0, 14).map((tag) => (
              <button
                key={tag.id}
                onClick={() => selectTag(tag)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
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
                  <>{t("teachings.hub.resultsFor")} «&nbsp;{debouncedSearch}&nbsp;»</>
                ) : (
                  <>{t("teachings.hub.topicLabel")} {activeTag?.name}</>
                )}
              </SectionTitle>
              {!resultsLoading && (
                <p className="text-sm text-gray-400">
                  {resultsTotal}{" "}
                  {resultsTotal > 1
                    ? t("teachings.common.teachingPlural")
                    : t("teachings.common.teachingSingular")}
                </p>
              )}
            </div>

            {resultsLoading ? (
              <RowSkeleton />
            ) : resultItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                {t("teachings.hub.noResults")}
              </p>
            ) : (
              <>
                <RowList items={resultItems} />
                <LoadMoreButton
                  remaining={resultsTotal - resultItems.length}
                  loading={isFetchingMoreResults}
                  onClick={() => fetchMoreResults()}
                />
              </>
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
              <SectionTitle>{t("teachings.hub.browseByTheme")}</SectionTitle>

              {themesLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100 sm:h-40" />
                  ))}
                </div>
              ) : visibleThemes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                  {t("teachings.hub.comingSoon")}
                </p>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                  className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3"
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
                className={`grid grid-cols-1 gap-12 ${showPopular ? "lg:grid-cols-2" : ""}`}
              >
                <motion.div variants={fadeUp} className="space-y-6">
                  <SectionTitle>{t("teachings.hub.latest")}</SectionTitle>
                  <RowList items={recent!.items} />
                </motion.div>

                {showPopular && (
                  <motion.div variants={fadeUp} className="space-y-6">
                    <SectionTitle>{t("teachings.hub.mostPlayed")}</SectionTitle>
                    <RowList items={popular!.items} />
                  </motion.div>
                )}
              </motion.div>
            </section>
          )}

          {/* Teaser vidéos — visible seulement si la chaîne a été synchronisée */}
          {(videos?.items.length ?? 0) > 0 && (
            <section className="mx-auto max-w-6xl px-4 pt-16 lg:px-8">
              <motion.div {...inView()} variants={stagger} className="space-y-6">
                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-baseline justify-between gap-2"
                >
                  <SectionTitle>{t("teachings.hub.latestVideos")}</SectionTitle>
                  <Link
                    href={`/${locale}/enseignements/videos`}
                    className="text-sm font-semibold text-cecj-green transition hover:underline"
                  >
                    {t("teachings.hub.allVideos")}
                  </Link>
                </motion.div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {videos!.items.map((video) => (
                    <motion.div key={video.id} variants={fadeUp}>
                      <VideoCard video={video} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
