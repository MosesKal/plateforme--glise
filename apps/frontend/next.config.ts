import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cecj/shared"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      // Backend local (dev)
      { protocol: "http", hostname: "localhost", port: "3001" },
      // Backend en production (à ajuster avec le vrai domaine)
      { protocol: "https", hostname: "*.cecj.org" },
    ],
  },
  async headers() {
    return [
      {
        // Pages HTML uniquement : chemins sans extension (ex. /fr, /fr/vision, /admin).
        // Les assets immutables /_next/static/* gardent leur cache long automatiquement
        // (Next.js, non surchargeable) ; les fichiers /public (.jpg, .ico…) sont exclus
        // par le point dans le nom et conservent leur cache par défaut.
        // Objectif : forcer la revalidation du HTML pour que chaque déploiement soit
        // visible immédiatement (fini le s-maxage=1 an par défaut des pages SSG).
        source: "/:path((?!_next/|.*\\.).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
