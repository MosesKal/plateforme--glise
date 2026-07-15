import "server-only"
import type { Locale } from "@/lib/locales"

export type { Locale } from "@/lib/locales"
export { locales, defaultLocale, hasLocale } from "@/lib/locales"

const dictionaries = {
  fr: () => import("@/messages/fr.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
}

export const getDictionary = (locale: Locale) => dictionaries[locale]()

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
