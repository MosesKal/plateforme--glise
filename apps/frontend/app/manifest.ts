import type { MetadataRoute } from "next"

/**
 * Manifest PWA : rend le site installable sur l'écran d'accueil (mobile et
 * desktop) avec un affichage plein écran type application. Next le sert sur
 * /manifest.webmanifest et ajoute le <link rel="manifest"> automatiquement.
 *
 * Les icônes sont générées par app/pwa-icon/[size]/route.tsx — même design
 * que app/icon.tsx (favicon). `maskable` : Android découpe l'icône selon la
 * forme du launcher, le logo est donc centré dans la zone sûre.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Église Camp de Jésus-Christ Bel-air",
    short_name: "C.E.C.J.C.",
    description:
      "Enseignements, événements et vie de l'Église Camp de Jésus-Christ Bel-air.",
    start_url: "/",
    display: "standalone",
    background_color: "#024339",
    theme_color: "#024339",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
