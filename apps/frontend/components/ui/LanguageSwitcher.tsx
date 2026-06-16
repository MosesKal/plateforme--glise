"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/components/providers/I18nProvider"
import { cn } from "@/lib/utils"

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
]

const LOCALE_COOKIE = "CECJ_LOCALE"
const ONE_YEAR = 60 * 60 * 24 * 365

export function LanguageSwitcher() {
  const { locale } = useI18n()
  const pathname = usePathname()

  function switchLocalePath(targetLocale: string) {
    const segments = pathname.split("/")
    segments[1] = targetLocale
    return segments.join("/") || "/"
  }

  function persistLocale(targetLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${targetLocale};path=/;max-age=${ONE_YEAR};SameSite=Lax`
  }

  return (
    <div className="flex items-center rounded-md border border-white/20 overflow-hidden">
      {LOCALES.map(({ code, label }) => (
        <Link
          key={code}
          href={switchLocalePath(code)}
          onClick={() => persistLocale(code)}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold transition-colors",
            locale === code
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white hover:bg-white/10"
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
