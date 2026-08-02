"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow";
import { ResumeListening } from "@/components/features/teachings/audio/ResumeListening";
import { useI18n } from "@/components/providers/I18nProvider";
import { LoadMoreButton } from "@/components/shared/LoadMoreButton";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useInfiniteAudioTeachings,
  useTeachingTags,
  useTeachingThemes,
} from "@/hooks/useTeachings";
import { fadeUp, inView, stagger } from "@/lib/motion";
import type { TeachingTheme } from "@/lib/api/teachings";

const PAGE_SIZE = 20;

type LibrarySort = "recent" | "popular";

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
      />
    </svg>
  );
}

function RowSkeleton() {
  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-[76px] animate-pulse bg-gray-50/80" />
      ))}
    </div>
  );
}

/**
 * Catalogue public unique. Les thèmes et sujets sont des facettes de la même
 * liste : l'utilisateur n'a plus à deviner dans quelle collection chercher.
 */
export function AudioLibraryContent() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [themeSlug, setThemeSlug] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [sort, setSort] = useState<LibrarySort>("recent");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const searchActive = debouncedSearch.length >= 2;

  const { data: themes = [], isLoading: themesLoading } = useTeachingThemes();
  const { data: tags = [] } = useTeachingTags();
  const visibleThemes = useMemo(
    () => themes.filter((theme) => theme._count.audioTeachings > 0),
    [themes],
  );
  const libraryTotal = useMemo(
    () =>
      visibleThemes.reduce(
        (total, theme) => total + theme._count.audioTeachings,
        0,
      ),
    [visibleThemes],
  );

  const { data, isLoading, isError, fetchNextPage, isFetchingNextPage } =
    useInfiniteAudioTeachings({
      search: searchActive ? debouncedSearch : undefined,
      themeSlug: themeSlug || undefined,
      tag: tagSlug || undefined,
      sort,
      limit: PAGE_SIZE,
    });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;
  const selectedTheme = visibleThemes.find((theme) => theme.slug === themeSlug);
  const selectedTag = tags.find((tag) => tag.slug === tagSlug);
  const hasFilters = Boolean(themeSlug || tagSlug || searchActive);

  const themeName = (theme: TeachingTheme) =>
    locale === "en" && theme.nameEn ? theme.nameEn : theme.nameFr;

  const clearFilters = () => {
    setSearch("");
    setThemeSlug("");
    setTagSlug("");
  };

  const selectTheme = (slug: string) => {
    setThemeSlug(slug);
    setTagSlug("");
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7] pb-24">
      <section className="relative overflow-hidden bg-cecj-green py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <motion.div
          {...inView()}
          variants={stagger}
          className="relative mx-auto max-w-4xl space-y-5 px-4 text-center lg:px-8"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cecj-gold"
          >
            {t("teachings.audios.badge")}
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold text-white md:text-5xl"
          >
            {t("teachings.audios.title")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            {t("teachings.audios.intro")}
          </motion.p>
          {!themesLoading && libraryTotal > 0 && (
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-widest text-white/45"
            >
              {libraryTotal} {t("teachings.common.teachingPlural")} ·{" "}
              {visibleThemes.length} {t("teachings.audios.themePlural")}
            </motion.p>
          )}

          <motion.div variants={fadeUp} className="mx-auto max-w-2xl pt-2">
            <label className="relative block">
              <span className="sr-only">
                {t("teachings.hub.searchPlaceholder")}
              </span>
              <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("teachings.hub.searchPlaceholder")}
                className="w-full rounded-2xl border border-white/15 bg-white/10 py-4 pl-13 pr-12 text-base text-white outline-none backdrop-blur transition placeholder:text-white/40 focus:border-cecj-gold/70 focus:bg-white/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t("teachings.common.clearSearch")}
                  className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </label>
          </motion.div>
        </motion.div>
      </section>

      <ResumeListening />

      <section className="mx-auto max-w-7xl px-4 pt-10 lg:px-8">
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="sr-only">
                {t("teachings.audios.themeFilter")}
              </span>
              <select
                value={themeSlug}
                onChange={(event) => selectTheme(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-cecj-green"
              >
                <option value="">{t("teachings.audios.allThemes")}</option>
                {visibleThemes.map((theme) => (
                  <option key={theme.id} value={theme.slug}>
                    {themeName(theme)} ({theme._count.audioTeachings})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">{t("teachings.audios.sortLabel")}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as LibrarySort)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-cecj-green"
              >
                <option value="recent">
                  {t("teachings.audios.recentFirst")}
                </option>
                <option value="popular">{t("teachings.hub.mostPlayed")}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden self-start rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:block">
            <div className="px-3 pb-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                {t("teachings.hub.browseByTheme")}
              </p>
            </div>
            <div className="max-h-[32rem] space-y-1 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => selectTheme("")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  !themeSlug
                    ? "bg-cecj-green text-white"
                    : "text-gray-600 hover:bg-cecj-green/5 hover:text-cecj-green"
                }`}
              >
                <span>{t("teachings.audios.allThemes")}</span>
                <span
                  className={`text-xs ${!themeSlug ? "text-white/60" : "text-gray-400"}`}
                >
                  {libraryTotal}
                </span>
              </button>
              {visibleThemes.map((theme) => {
                const active = theme.slug === themeSlug;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => selectTheme(theme.slug)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-cecj-green text-white"
                        : "text-gray-600 hover:bg-cecj-green/5 hover:text-cecj-green"
                    }`}
                  >
                    <span className="truncate font-medium">
                      {themeName(theme)}
                    </span>
                    <span
                      className={`shrink-0 text-xs ${active ? "text-white/60" : "text-gray-400"}`}
                    >
                      {theme._count.audioTeachings}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cecj-green">
                  {t("teachings.audios.catalogBadge")}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
                  {searchActive
                    ? `${t("teachings.hub.resultsFor")} « ${debouncedSearch} »`
                    : selectedTag
                      ? `${t("teachings.hub.topicLabel")} ${selectedTag.name}`
                      : selectedTheme
                        ? themeName(selectedTheme)
                        : t("teachings.audios.libraryTitle")}
                </h2>
                {!isLoading && (
                  <p className="mt-1 text-sm text-gray-500">
                    {total}{" "}
                    {total === 1
                      ? t("teachings.common.teachingSingular")
                      : t("teachings.common.teachingPlural")}
                  </p>
                )}
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-xs font-semibold text-gray-400">
                  {t("teachings.audios.sortLabel")}
                </span>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as LibrarySort)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-cecj-green"
                >
                  <option value="recent">
                    {t("teachings.audios.recentFirst")}
                  </option>
                  <option value="popular">
                    {t("teachings.hub.mostPlayed")}
                  </option>
                </select>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:px-0">
                {tags.slice(0, 16).map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setTagSlug((current) =>
                        current === tag.slug ? "" : tag.slug,
                      )
                    }
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      tagSlug === tag.slug
                        ? "border-cecj-green bg-cecj-green text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-cecj-green hover:text-cecj-green"
                    }`}
                  >
                    {tag.name}{" "}
                    <span className="ml-1 opacity-55">{tag.count}</span>
                  </button>
                ))}
              </div>
            )}

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cecj-green/10 bg-cecj-green/[0.04] px-3 py-2">
                <span className="text-xs font-medium text-cecj-green">
                  {t("teachings.audios.filteredView")}
                </span>
                {selectedTheme && (
                  <Link
                    href={`/${locale}/enseignements/audio/${selectedTheme.slug}`}
                    className="text-xs font-semibold text-cecj-green underline underline-offset-2"
                  >
                    {t("teachings.audios.openTheme")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto text-xs font-bold text-cecj-green hover:underline"
                >
                  {t("teachings.audios.clearFilters")}
                </button>
              </div>
            )}

            {isLoading ? (
              <RowSkeleton />
            ) : isError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center text-sm text-red-700">
                {t("teachings.audios.loadError")}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center">
                <p className="text-sm text-gray-500">
                  {t("teachings.hub.noResults")}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-bold text-cecj-green hover:underline"
                  >
                    {t("teachings.audios.clearFilters")}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {items.map((teaching, index) => (
                    <AudioTeachingRow
                      key={teaching.id}
                      teaching={teaching}
                      queue={items}
                      index={index}
                      variant="flush"
                      showTheme={!themeSlug}
                    />
                  ))}
                </div>
                <LoadMoreButton
                  remaining={total - items.length}
                  loading={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
