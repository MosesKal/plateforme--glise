import { defaultLocale, hasLocale } from "@/lib/locales"

/**
 * Les routes admin ((admin)/admin/...) vivent hors du segment [locale] :
 * leur URL ne contient donc jamais la langue. On retombe sur defaultLocale
 * dans ce cas, comme pour toute URL dont le premier segment n'est pas fr/en.
 */
export function getLoginUrl(pathname: string): string {
  const [, firstSegment] = pathname.split("/")
  const locale = hasLocale(firstSegment) ? firstSegment : defaultLocale
  return `/${locale}/login`
}
