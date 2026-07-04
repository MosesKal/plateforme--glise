export const CONFIG = {
  appName:    "C.E.C.J.C.",
  appFullName: "Église Camp de Jésus Bel-air",
  // Doit inclure le préfixe /api/v1, comme la baseURL du client axios
  // (lib/api/client.ts) — les deux fallbacks restent synchronisés.
  apiUrl:     process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
} as const
