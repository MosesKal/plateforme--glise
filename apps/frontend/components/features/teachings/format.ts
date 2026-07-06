/** "1:05:32" ou "45:07" à partir de secondes. */
export function formatDuration(totalSec: number): string {
  if (!totalSec || totalSec <= 0) return "--:--"
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = Math.floor(totalSec % 60)
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m)
  const ss = String(s).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** "12 mars 2026" / "12 March 2026" selon la locale du site (fr | en). */
export function formatTeachingDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** "24,3 Mo" à partir d'octets. */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "—"
  const mo = bytes / (1024 * 1024)
  return mo >= 1
    ? `${mo.toFixed(1).replace(".", ",")} Mo`
    : `${Math.round(bytes / 1024)} Ko`
}
