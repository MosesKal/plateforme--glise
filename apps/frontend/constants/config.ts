export const CONFIG = {
  appName: "C.E.C.J.C.",
  appFullName: "Église Camp de Jésus-Christ Bel-Air Fizi",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://campdejesusbelairfizi.com"
      : "http://localhost:3000"),
  // Doit inclure le préfixe /api/v1, comme la baseURL du client axios
  // (lib/api/client.ts) — les deux fallbacks restent synchronisés.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
} as const
