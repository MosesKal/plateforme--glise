const dictionaries = {
  fr: true,
  en: true,
} as const

export type Locale = keyof typeof dictionaries

export const locales = Object.keys(dictionaries) as Locale[]
export const defaultLocale: Locale = "fr"

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries
