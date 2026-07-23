import type { MetadataRoute } from "next"
import { CONFIG } from "@/constants/config"
import {
  INDEXABLE_SITE_PATHS,
  localizedPath,
  SEO_LOCALES,
} from "@/lib/seo"
import {
  fetchSeoData,
  type PaginatedSeoItems,
  type SeoAudio,
  type SeoTheme,
} from "@/lib/seo-data"

const HIGH_PRIORITY_PATHS = new Set([
  "/",
  "/a-propos",
  "/enseignements",
  "/evenements",
  "/extensions",
  "/contact",
])

function languageAlternates(path: string) {
  return {
    fr: new URL(localizedPath("fr", path), CONFIG.siteUrl).toString(),
    en: new URL(localizedPath("en", path), CONFIG.siteUrl).toString(),
    "x-default": new URL(localizedPath("fr", path), CONFIG.siteUrl).toString(),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [themes, firstAudioPage] = await Promise.all([
    fetchSeoData<SeoTheme[]>("/teachings/themes"),
    fetchSeoData<PaginatedSeoItems<SeoAudio>>("/teachings/audio?limit=100&page=1"),
  ])
  const remainingPages = firstAudioPage
    ? await Promise.all(
        Array.from({ length: Math.max(0, firstAudioPage.totalPages - 1) }, (_, index) =>
          fetchSeoData<PaginatedSeoItems<SeoAudio>>(
            `/teachings/audio?limit=100&page=${index + 2}`,
          ),
        ),
      )
    : []
  const audioItems = [
    ...(firstAudioPage?.items ?? []),
    ...remainingPages.flatMap((page) => page?.items ?? []),
  ]

  const staticEntries: MetadataRoute.Sitemap = INDEXABLE_SITE_PATHS.flatMap((path) =>
    SEO_LOCALES.map((locale) => ({
      url: new URL(localizedPath(locale, path), CONFIG.siteUrl).toString(),
      changeFrequency:
        path === "/" || path === "/evenements" || path.startsWith("/enseignements")
          ? ("weekly" as const)
          : ("monthly" as const),
      priority: path === "/" ? 1 : HIGH_PRIORITY_PATHS.has(path) ? 0.8 : 0.6,
      alternates: { languages: languageAlternates(path) },
    })),
  )

  const themeEntries: MetadataRoute.Sitemap = (themes ?? []).flatMap((theme) =>
    SEO_LOCALES.map((locale) => {
      const path = `/enseignements/audio/${theme.slug}`
      return {
        url: new URL(localizedPath(locale, path), CONFIG.siteUrl).toString(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: { languages: languageAlternates(path) },
      }
    }),
  )

  const audioEntries: MetadataRoute.Sitemap = audioItems.flatMap((audio) =>
    SEO_LOCALES.map((locale) => {
      const path = `/enseignements/audio/${audio.theme.slug}/${audio.slug}`
      return {
        url: new URL(localizedPath(locale, path), CONFIG.siteUrl).toString(),
        lastModified: audio.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages: languageAlternates(path) },
      }
    }),
  )

  return [...staticEntries, ...themeEntries, ...audioEntries]
}
