import type { MetadataRoute } from "next"
import { CONFIG } from "@/constants/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/fr/login", "/en/login", "/fr/register", "/en/register"],
    },
    sitemap: `${CONFIG.siteUrl}/sitemap.xml`,
    host: CONFIG.siteUrl,
  }
}
