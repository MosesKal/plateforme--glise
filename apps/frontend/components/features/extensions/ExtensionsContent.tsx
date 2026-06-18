"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import {
  EXTENSIONS,
  CONTINENT_LABELS,
  TYPE_LABELS,
  flagEmoji,
  haversineKm,
  type Extension,
  type Continent,
} from "@/constants/extensions"
import { fadeUp, stagger, scaleUp, inView } from "@/lib/motion"
import { cn } from "@/lib/utils"

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = {
  extensions: EXTENSIONS.length,
  countries:  new Set(EXTENSIONS.map((e) => e.countryCode)).size,
  continents: new Set(EXTENSIONS.map((e) => e.continent)).size,
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const I = {
  search:  "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016 15.803z",
  pin:     "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  phone:   "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  user:    "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  globe:   "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  locate:  "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  calendar:"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  cross:   "M6 18L18 6M6 6l12 12",
}

// ─── Extension card ───────────────────────────────────────────────────────────

function ExtensionCard({
  ext,
  distanceKm,
  isNearest,
  locale,
}: {
  ext: Extension
  distanceKm?: number
  isNearest?: boolean
  locale: string
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  const typeLbl   = TYPE_LABELS[ext.type][locale as "fr" | "en"]
  const isSiege   = ext.type === "siege"
  const isActive  = ext.status === "active"

  return (
    <motion.div
      layout
      variants={scaleUp}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
        isSiege   ? "border-cecj-gold/40 ring-1 ring-cecj-gold/20" :
        isNearest ? "border-cecj-green/40 ring-1 ring-cecj-green/20" :
                    "border-gray-100",
      )}
    >
      {/* Bandeau supérieur coloré */}
      <div className={cn(
        "h-1.5 w-full",
        isSiege   ? "bg-cecj-gold" :
        isNearest ? "bg-cecj-green" :
        isActive  ? "bg-emerald-400" :
                    "bg-gray-200",
      )} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header : drapeau + badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none" role="img" aria-label={ext.country}>
              {flagEmoji(ext.countryCode)}
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-400">{ext.city}, {ext.country}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {isSiege && (
              <span className="rounded-full bg-cecj-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cecj-green">
                Siège
              </span>
            )}
            {isNearest && !isSiege && (
              <span className="rounded-full bg-cecj-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cecj-green">
                {t("extensionsPage.nearest_label")}
              </span>
            )}
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
            )}>
              {isActive ? t("extensionsPage.status_active") : t("extensionsPage.status_establishing")}
            </span>
          </div>
        </div>

        {/* Nom */}
        <div>
          <span className="mb-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {typeLbl}
          </span>
          <h3 className="mt-1 font-bold leading-snug text-cecj-green">{ext.name}</h3>
        </div>

        {/* Distance */}
        {distanceKm !== undefined && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-cecj-green">
            <Icon d={I.pin} className="h-4 w-4 shrink-0 text-cecj-green" />
            {distanceKm < 1
              ? "< 1 km"
              : distanceKm < 1000
              ? `${Math.round(distanceKm)} km`
              : `${(distanceKm / 1000).toFixed(1)} 000 km`}{" "}
            <span className="font-normal text-gray-400">{t("extensionsPage.distance_label")}</span>
          </div>
        )}

        {/* Infos principales */}
        <div className="space-y-1.5 text-sm text-gray-500">
          {ext.pastor && (
            <div className="flex items-center gap-2">
              <Icon d={I.user} className="h-4 w-4 shrink-0 text-cecj-green/60" />
              <span><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("extensionsPage.pastor_label")} </span>{ext.pastor}</span>
            </div>
          )}
          {ext.founded && (
            <div className="flex items-center gap-2">
              <Icon d={I.calendar} className="h-4 w-4 shrink-0 text-cecj-green/60" />
              <span><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("extensionsPage.founded_label")} </span>{ext.founded}</span>
            </div>
          )}
          {ext.members && (
            <div className="flex items-center gap-2">
              <Icon d={I.globe} className="h-4 w-4 shrink-0 text-cecj-green/60" />
              <span><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("extensionsPage.members_label")} </span>{ext.members}</span>
            </div>
          )}
        </div>

        {/* Détails dépliables */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm text-gray-500">
                {ext.address && (
                  <div className="flex items-start gap-2">
                    <Icon d={I.pin} className="mt-0.5 h-4 w-4 shrink-0 text-cecj-green/60" />
                    <span>{ext.address}</span>
                  </div>
                )}
                {ext.phone && (
                  <a href={`tel:${ext.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-cecj-green">
                    <Icon d={I.phone} className="h-4 w-4 shrink-0 text-cecj-green/60" />
                    <span>{ext.phone}</span>
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle détails */}
        {(ext.address || ext.phone) && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-auto text-left text-xs font-semibold text-cecj-green transition-opacity hover:opacity-70"
          >
            {expanded ? "Masquer les détails ↑" : "Voir les détails ↓"}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Country group header ─────────────────────────────────────────────────────

function CountryGroup({ country, code, children }: { country: string; code: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label={country}>{flagEmoji(code)}</span>
        <div>
          <h3 className="font-bold text-cecj-green">{country}</h3>
        </div>
        <div className="flex-1 border-t border-gray-100" />
      </div>
      {children}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type UserPos = { lat: number; lng: number } | null

export function ExtensionsContent() {
  const { t, locale } = useI18n()
  const lang = locale as "fr" | "en"

  const [query,        setQuery]        = useState("")
  const [continent,    setContinent]    = useState<Continent | "all">("all")
  const [userPos,      setUserPos]      = useState<UserPos>(null)
  const [geoLoading,   setGeoLoading]   = useState(false)
  const [geoError,     setGeoError]     = useState(false)

  // Geolocation
  const handleLocate = () => {
    if (!navigator.geolocation) { setGeoError(true); return }
    setGeoLoading(true)
    setGeoError(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
        setContinent("all")
        setQuery("")
      },
      () => { setGeoError(true); setGeoLoading(false) },
    )
  }

  const clearLocation = () => setUserPos(null)

  // Distances
  const withDistance = useMemo(() => {
    if (!userPos) return EXTENSIONS.map((e) => ({ ext: e, dist: undefined as number | undefined }))
    return EXTENSIONS
      .map((e) => ({ ext: e, dist: haversineKm(userPos.lat, userPos.lng, e.lat, e.lng) }))
      .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0))
  }, [userPos])

  const nearestId = userPos ? withDistance[0]?.ext.id : undefined

  // Filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return withDistance.filter(({ ext }) => {
      const matchContinent = continent === "all" || ext.continent === continent
      const matchQuery     = !q ||
        ext.city.toLowerCase().includes(q)    ||
        ext.country.toLowerCase().includes(q) ||
        (ext.pastor ?? "").toLowerCase().includes(q) ||
        ext.name.toLowerCase().includes(q)
      return matchContinent && matchQuery
    })
  }, [withDistance, continent, query])

  // Group by country (when not sorted by distance)
  const grouped = useMemo(() => {
    if (userPos) return null
    const map = new Map<string, { country: string; code: string; items: typeof filtered }>()
    for (const item of filtered) {
      const key = item.ext.countryCode
      if (!map.has(key)) map.set(key, { country: item.ext.country, code: key, items: [] })
      map.get(key)!.items.push(item)
    }
    return Array.from(map.values())
  }, [filtered, userPos])

  const continents: Array<{ key: Continent | "all"; label: string }> = [
    { key: "all",     label: t("extensionsPage.filter_all") },
    { key: "rdc",     label: CONTINENT_LABELS.rdc[lang]     },
    { key: "afrique", label: CONTINENT_LABELS.afrique[lang] },
  ]

  return (
    <main className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,203,50,0.06) 0%, transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-6">
            <motion.span variants={fadeUp} className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
              {t("extensionsPage.hero_badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {t("extensionsPage.hero_title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-lg text-white/70">
              {t("extensionsPage.hero_subtitle")}
            </motion.p>

            {/* Stats */}
            <motion.div variants={stagger} className="flex justify-center gap-6 pt-2 sm:gap-12">
              {[
                { value: `${STATS.extensions}+`, label: t("extensionsPage.stat_extensions") },
                { value: `${STATS.countries}+`,  label: t("extensionsPage.stat_countries")  },
                { value: `${STATS.continents}`,  label: t("extensionsPage.stat_continents") },
              ].map(({ value, label }) => (
                <motion.div key={label as string} variants={fadeUp} className="text-center">
                  <p className="text-3xl font-bold text-cecj-gold sm:text-4xl">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/50">{label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Search bar in hero */}
            <motion.div variants={fadeUp} className="mx-auto max-w-lg pt-2">
              <div className="relative">
                <Icon d={I.search} className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("extensionsPage.search_placeholder") as string}
                  className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm outline-none transition focus:border-cecj-gold/60 focus:bg-white/15"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <Icon d={I.cross} className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Filtres + Géolocalisation (sticky) ────────────────────── */}
      <div className="sticky top-[64px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:px-8">
          {/* Tabs continent */}
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {continents.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setContinent(key); setUserPos(null) }}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  continent === key && !userPos
                    ? "bg-cecj-green text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bouton géolocalisation */}
          <button
            onClick={userPos ? clearLocation : handleLocate}
            disabled={geoLoading}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              userPos
                ? "bg-cecj-green text-white"
                : "border border-cecj-green/30 text-cecj-green hover:bg-cecj-green/5",
              geoLoading && "animate-pulse opacity-60",
            )}
          >
            <Icon d={I.locate} className="h-4 w-4" />
            <span className="hidden sm:inline">
              {geoLoading ? t("extensionsPage.locating") : userPos ? "Ma position ✓" : t("extensionsPage.locate_btn")}
            </span>
          </button>
        </div>
        {geoError && (
          <p className="bg-red-50 px-4 py-2 text-center text-xs text-red-600">{t("extensionsPage.geoloc_error")}</p>
        )}
      </div>

      {/* ── Liste des extensions ────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:px-8">

        {filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">{t("extensionsPage.no_results")}</p>
          </div>
        ) : userPos ? (
          /* Mode géolocalisation : tri par distance, pas de groupement */
          <div>
            <motion.p {...inView()} variants={fadeUp} className="mb-6 text-sm font-semibold uppercase tracking-widest text-cecj-green/60">
              {filtered.length} église{filtered.length > 1 ? "s" : ""} — triée{filtered.length > 1 ? "s" : ""} par proximité
            </motion.p>
            <motion.div {...inView()} variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(({ ext, dist }) => (
                <ExtensionCard key={ext.id} ext={ext} distanceKm={dist} isNearest={ext.id === nearestId} locale={lang} />
              ))}
            </motion.div>
          </div>
        ) : grouped ? (
          /* Mode normal : groupé par pays */
          <div className="space-y-12">
            {grouped.map(({ country, code, items }) => (
              <motion.div key={code} {...inView()} variants={stagger}>
                <CountryGroup country={country} code={code}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(({ ext }) => (
                      <ExtensionCard key={ext.id} ext={ext} locale={lang} />
                    ))}
                  </div>
                </CountryGroup>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>


    </main>
  )
}
