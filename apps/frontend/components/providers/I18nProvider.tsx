"use client"

import { createContext, useContext } from "react"
import type { Dictionary } from "@/lib/i18n"

type I18nContextType = {
  locale: string
  dict: Dictionary
  t: (key: string) => any
}

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  dict: {} as Dictionary,
  t: (key) => key,
})

export function useI18n() {
  return useContext(I18nContext)
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? path
}

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: string
  dict: Dictionary
  children: React.ReactNode
}) {
  const t = (key: string) => getNestedValue(dict, key)

  return (
    <I18nContext.Provider value={{ locale, dict, t }}>
      {children}
    </I18nContext.Provider>
  )
}
