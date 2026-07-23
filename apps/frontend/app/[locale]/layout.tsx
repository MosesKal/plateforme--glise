import type { Metadata, Viewport } from "next"
import { Montserrat, Great_Vibes } from "next/font/google"
import { notFound } from "next/navigation"
import NextTopLoader from "nextjs-toploader"
import { getDictionary, hasLocale } from "@/lib/i18n"
import {
  BRAND_SEARCH_VARIANTS,
  OG_DEFAULTS,
  SITE_TAB_TITLES,
  type SeoLocale,
} from "@/lib/seo"
import { CONFIG } from "@/constants/config"
import { CHURCH_INFO } from "@/constants/church"
import { I18nProvider } from "@/components/providers/I18nProvider"
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider"
import { AuthInitializer } from "@/components/auth/AuthInitializer"
import { SplashLoader } from "@/components/ui/SplashLoader"
import { GlobalAudioPlayer } from "@/components/features/teachings/player/GlobalAudioPlayer"
import "../globals.css"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
})

const greatVibes = Great_Vibes({
  variable: "--font-brittany",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

/**
 * Origine publique du frontend — indispensable pour résoudre en URLs absolues
 * l'image Open Graph par défaut et les og:url (WhatsApp/Facebook exigent de
 * l'absolu). Même logique de fallback que le backend (app-url.ts).
 */
const HOME_SEO = {
  fr: {
    title: SITE_TAB_TITLES.fr,
    description:
      "Site officiel de l'Église Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi : enseignements bibliques, événements, programme, extensions et vie de l'église.",
  },
  en: {
    title: SITE_TAB_TITLES.en,
    description:
      "Official website of Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi: Bible teachings, events, weekly program, extensions and church life.",
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale: SeoLocale = rawLocale === "en" ? "en" : "fr"
  return {
    metadataBase: new URL(CONFIG.siteUrl),
    title: { absolute: SITE_TAB_TITLES[locale] },
    description: HOME_SEO[locale].description,
    applicationName: CONFIG.appName,
    category: "religion",
    verification: CONFIG.googleSiteVerification
      ? { google: CONFIG.googleSiteVerification }
      : undefined,
    openGraph: {
      ...OG_DEFAULTS,
      title: HOME_SEO[locale].title,
      description: HOME_SEO[locale].description,
      locale: locale === "fr" ? "fr_CD" : "en",
      alternateLocale: locale === "fr" ? ["en"] : ["fr_CD"],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_SEO[locale].title,
      description: HOME_SEO[locale].description,
      images: ["/og"],
    },
    alternates: {
      types: {
        "application/rss+xml": [
          { url: "/podcast.xml", title: "Enseignements — C.E.C.J.C." },
        ],
      },
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // viewport-fit=cover : requis pour que env(safe-area-inset-*) fonctionne
  // sur iOS (le player audio fixe s'appuie dessus).
  viewportFit: "cover",
  themeColor: "#024339",
}

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as "fr" | "en")
  const sameAs = Object.values(CHURCH_INFO.socials).filter(
    (value): value is string => typeof value === "string" && value.startsWith("http"),
  )
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${CONFIG.siteUrl}/#church`,
    name: CHURCH_INFO.name,
    alternateName: BRAND_SEARCH_VARIANTS,
    url: CONFIG.siteUrl,
    logo: `${CONFIG.siteUrl}/icon`,
    image: `${CONFIG.siteUrl}/og`,
    description:
      locale === "fr"
        ? HOME_SEO.fr.description
        : HOME_SEO.en.description,
    telephone: CHURCH_INFO.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: CHURCH_INFO.location.fullAddress,
      addressLocality: CHURCH_INFO.location.city,
      addressCountry: "CD",
    },
    sameAs,
  }

  return (
    <html lang={locale} className={`${montserrat.variable} ${greatVibes.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SplashLoader />
        <NextTopLoader color="#ffcb32" height={3} showSpinner={false} />
        <ReactQueryProvider>
          <AuthInitializer />
          <I18nProvider locale={locale} dict={dict}>
            {children}
            {/* Player global : monté au niveau locale pour couvrir aussi
                l'accueil — la lecture survit à toute la navigation publique */}
            <GlobalAudioPlayer />
          </I18nProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
