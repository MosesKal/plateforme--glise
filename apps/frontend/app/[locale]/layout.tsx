import type { Metadata, Viewport } from "next"
import { Montserrat, Great_Vibes } from "next/font/google"
import { notFound } from "next/navigation"
import NextTopLoader from "nextjs-toploader"
import { getDictionary, hasLocale } from "@/lib/i18n"
import { OG_DEFAULTS } from "@/lib/seo"
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
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://campdejesusbelairfizi.com"
    : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Camps de Jésus-Christ Bel-air Fizi",
    template: "%s | Camps de Jésus-Christ Bel-air Fizi",
  },
  description:
    "Bienvenue à l'Église Camp de Jésus Bel-air, fondée sur la saine doctrine du Seigneur Jésus-Christ.",
  openGraph: {
    ...OG_DEFAULTS,
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    // <link rel="alternate" type="application/rss+xml"> : les applis podcast
    // et lecteurs RSS découvrent le flux depuis n'importe quelle page du site.
    types: {
      "application/rss+xml": [
        { url: "/podcast.xml", title: "Enseignements — C.E.C.J.C." },
      ],
    },
  },
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

  return (
    <html lang={locale} className={`${montserrat.variable} ${greatVibes.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full">
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
