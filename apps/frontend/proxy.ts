import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const LOCALES = ["fr", "en"] as const
const DEFAULT_LOCALE = "fr"
const LOCALE_COOKIE = "CECJ_LOCALE"

function getLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && LOCALES.includes(cookie as any)) return cookie

  const acceptLang = request.headers.get("accept-language") ?? ""
  const preferred = acceptLang.split(",")[0]?.split("-")[0]?.trim() ?? ""
  if (LOCALES.includes(preferred as any)) return preferred

  return DEFAULT_LOCALE
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (hasLocale) return NextResponse.next()

  const locale = getLocale(request)
  const newUrl = request.nextUrl.clone()
  newUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(newUrl)
}

export const config = {
  // `og$` : l'image Open Graph par défaut (/og) est servie hors locale —
  // sans exclusion, le proxy la redirigerait vers /fr/og (404) et les
  // crawlers WhatsApp/Facebook n'afficheraient aucun aperçu.
  matcher: ["/((?!_next|_vercel|api|admin|og$|.*\\..*).*)", "/"],
}
