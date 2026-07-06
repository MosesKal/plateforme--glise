"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteAudioTeachings, useTeachingTheme } from "@/hooks/useTeachings"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"
import { LoadMoreButton } from "@/components/shared/LoadMoreButton"

const PAGE_SIZE = 10

export function ThemeAudioContent({ themeSlug }: { themeSlug: string }) {
  const { t, locale } = useI18n()

  const { data: theme, isLoading: themeLoading, isError } = useTeachingTheme(themeSlug)

  const [filter, setFilter] = useState("")
  const debouncedFilter = useDebounce(filter.trim(), 300)

  // Recherche côté serveur : un thème peut dépasser 200 audios, un filtre
  // client sur la page chargée raterait tout ce qui n'est pas encore chargé.
  const {
    data: audio,
    isLoading: audioLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteAudioTeachings({
    themeSlug,
    search: debouncedFilter.length >= 2 ? debouncedFilter : undefined,
    limit: PAGE_SIZE,
  })

  const teachings = useMemo(() => audio?.pages.flatMap((p) => p.items) ?? [], [audio])
  const total = audio?.pages[0]?.total ?? 0

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-gray-500">{t("teachings.theme.notFound")}</p>
        <Link
          href={`/${locale}/enseignements`}
          className="mt-4 inline-block text-sm font-bold text-cecj-green underline underline-offset-4"
        >
          {t("teachings.common.backToTeachings")}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white pb-28">
      {/* En-tête du thème */}
      <section className="relative overflow-hidden bg-cecj-green py-10 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-4">
            <motion.div variants={fadeUp}>
              <Link
                href={`/${locale}/enseignements`}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cecj-gold hover:opacity-80"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                {t("teachings.hub.title")}
              </Link>
            </motion.div>

            {themeLoading ? (
              <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
            ) : theme ? (
              <>
                <motion.h1 variants={fadeUp} className="text-3xl font-bold text-white md:text-4xl">
                  {theme.nameFr}
                </motion.h1>
                {theme.descriptionFr && (
                  <motion.p variants={fadeUp} className="max-w-2xl text-white/70 leading-relaxed">
                    {theme.descriptionFr}
                  </motion.p>
                )}
                <motion.p variants={fadeUp} className="text-sm font-semibold text-cecj-gold">
                  {theme._count.audioTeachings}{" "}
                  {theme._count.audioTeachings > 1
                    ? t("teachings.common.teachingPlural")
                    : t("teachings.common.teachingSingular")}
                </motion.p>
              </>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Liste */}
      <section className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        {((theme?._count.audioTeachings ?? 0) > 8 || filter) && (
          <div className="mb-6">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("teachings.theme.searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/15 sm:max-w-sm sm:text-sm"
            />
          </div>
        )}

        {audioLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[74px] animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : teachings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
            {filter ? t("teachings.theme.noMatch") : t("teachings.theme.empty")}
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {teachings.map((teaching, index) => (
                <AudioTeachingRow
                  key={teaching.id}
                  teaching={teaching}
                  queue={teachings}
                  index={index}
                />
              ))}
            </div>
            <LoadMoreButton
              remaining={total - teachings.length}
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            />
          </>
        )}
      </section>
    </div>
  )
}
