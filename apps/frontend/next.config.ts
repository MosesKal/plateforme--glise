import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cecj/shared"],
  images: {
    // Prioritise AVIF (~50% plus léger que WebP), fallback WebP, puis JPEG/PNG original
    formats: ["image/avif", "image/webp"],
    // Cache les images générées 31 jours (les photos de l'église ne changent pas souvent)
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
};

export default nextConfig;
