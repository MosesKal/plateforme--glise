import type { Metadata, Viewport } from "next"
import { Montserrat, Great_Vibes } from "next/font/google"
import { notFound } from "next/navigation"
import NextTopLoader from "nextjs-toploader"
import { getDictionary, hasLocale } from "@/lib/i18n"
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

export const metadata: Metadata = {
  title: {
    default: "Camps de Jésus-Christ Bel-air Fizi",
    template: "%s | Camps de Jésus-Christ Bel-air Fizi",
  },
  description:
    "Bienvenue à l'Église Camp de Jésus Bel-air, fondée sur la saine doctrine du Seigneur Jésus-Christ.",
  openGraph: {
    siteName: "C.E.C.J.C.",
    type: "website",
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
