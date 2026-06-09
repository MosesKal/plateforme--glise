import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "C.E.C.J. — Communauté des Eglise Camps de Jésus-Christ",
    template: "%s | C.E.C.J.",
  },
  description:
    "Communauté des Eglise Camps de Jésus-Christ — Plateforme officielle de l'église C.E.C.J.",
  icons: {
    icon: "/Logo C.E.C.j.png",
    apple: "/Logo C.E.C.j.png",
  },
  openGraph: {
    siteName: "C.E.C.J.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${montserrat.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
