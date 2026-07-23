export const EVENT_CATEGORIES = [
  "Action de grâces",
  "Ecole de tyrannus",
  "Concours biblique",
  "Culte spécial",
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]

const LEGACY_EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  "Action de graces": "Action de grâces",
  "Action de grâce": "Action de grâces",
  "Louange & Adoration": "Action de grâces",
  "École de Tyrannus": "Ecole de tyrannus",
  "Ecole de Tyrannus": "Ecole de tyrannus",
  "Concours Biblique": "Concours biblique",
  "Culte special": "Culte spécial",
  "Conférence des Femmes": "Culte spécial",
  "Conference des Femmes": "Culte spécial",
  "Rencontre des Mamans": "Culte spécial",
}

export function normalizeEventCategory(value?: string | null): EventCategory {
  if (value && EVENT_CATEGORIES.includes(value as EventCategory)) {
    return value as EventCategory
  }
  return value ? (LEGACY_EVENT_CATEGORY_MAP[value] ?? "Culte spécial") : "Culte spécial"
}
