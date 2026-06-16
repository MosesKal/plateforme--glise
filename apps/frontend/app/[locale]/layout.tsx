import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale } from "@/lib/i18n"
import { I18nProvider } from "@/components/providers/I18nProvider"
import "../globals.css"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "C.E.C.J. — Camp de Jésus Bel-Air",
    template: "%s | C.E.C.J.",
  },
  description:
    "Bienvenue au Camp de Jésus Bel-Air. Une communauté chrétienne fondée sur la saine doctrine du Seigneur Jésus-Christ.",
  icons: {
    icon: "/Logo C.E.C.j.png",
    apple: "/Logo C.E.C.j.png",
  },
  openGraph: {
    siteName: "C.E.C.J.",
    type: "website",
  },
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
    <html lang={locale} className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full">
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
