"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { CHURCH_INFO } from "@/constants/church"
import { isEventUpcoming, type ChurchEvent } from "@/constants/events"
import { useEvents } from "@/hooks/useEvents"
import { fadeUp, fadeIn, stagger, scaleUp, inView } from "@/lib/motion"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DOW_FR    = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
const DOW_EN    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const CATEGORY_DOT: Record<string, string> = {
  "Louange & Adoration":   "bg-amber-400",
  "Rencontre des Mamans":  "bg-rose-400",
  "École de Tyrannus":     "bg-indigo-500",
  "Concours Biblique":     "bg-purple-500",
  "Culte spécial":         "bg-cecj-green",
  "Conférence des Femmes": "bg-pink-400",
}

const CATEGORY_BADGE: Record<string, string> = {
  "Louange & Adoration":   "bg-amber-400/10 text-amber-700 border-amber-200",
  "Rencontre des Mamans":  "bg-rose-400/10 text-rose-700 border-rose-200",
  "École de Tyrannus":     "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "Concours Biblique":     "bg-purple-500/10 text-purple-700 border-purple-200",
  "Culte spécial":         "bg-cecj-green/10 text-cecj-green border-cecj-green/20",
  "Conférence des Femmes": "bg-pink-400/10 text-pink-700 border-pink-200",
}

function dotColor(cat: string)   { return CATEGORY_DOT[cat]   ?? "bg-gray-400" }
function badgeColor(cat: string) { return CATEGORY_BADGE[cat] ?? "bg-gray-100 text-gray-600 border-gray-200" }

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function calendarGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const offset   = (firstDow + 6) % 7
  const total    = new Date(year, month + 1, 0).getDate()
  const grid: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function eventsOnDay(events: ChurchEvent[], year: number, month: number, day: number) {
  const iso = toIso(year, month, day)
  return events.filter((e) => e.startDate <= iso && e.endDate >= iso)
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(targetIso: string | null) {
  const [remaining, setRemaining] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    if (!targetIso) return
    const target = new Date(`${targetIso}T00:00:00`).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setRemaining({ d: 0, h: 0, m: 0, s: 0 }); return }
      setRemaining({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [targetIso])

  return remaining
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ChevronIcon({ direction, className }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  )
}

// ─── Category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold", badgeColor(category))}>
      {category}
    </span>
  )
}

// ─── Featured event card ──────────────────────────────────────────────────────

function FeaturedCard({ event }: { event: ChurchEvent }) {
  const { t } = useI18n()
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-56 sm:h-72">
        <Image src={event.image} alt={event.title} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-cecj-red px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {t("evenementsPage.upcoming_badge")}
        </span>
        <div className="absolute bottom-0 left-0 p-5">
          <CategoryBadge category={event.category} />
          <h3 className="mt-2 text-xl font-bold leading-snug text-white sm:text-2xl">{event.title}</h3>
        </div>
      </div>
      <div className="space-y-2.5 p-5">
        {event.speaker   && <p className="text-sm text-gray-500">{t("evenementsPage.speaker_label")} <span className="font-semibold text-cecj-green">{event.speaker}</span></p>}
        {event.organizer && <p className="text-sm text-gray-400 italic">{event.organizer}</p>}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 shrink-0 text-cecj-green" />
          {event.dateLabel} · {event.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PinIcon className="h-4 w-4 shrink-0 text-cecj-green" />
          {event.location}
        </div>
      </div>
    </div>
  )
}

// ─── Compact upcoming card ────────────────────────────────────────────────────

function CompactCard({ event }: { event: ChurchEvent }) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
        <Image src={event.image} alt={event.title} fill className="object-cover" sizes="80px" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <CategoryBadge category={event.category} />
        <h4 className="font-bold leading-snug text-cecj-green line-clamp-2">{event.title}</h4>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <ClockIcon className="h-3.5 w-3.5 shrink-0" />
          {event.dateLabel} · {event.time}
        </div>
      </div>
    </div>
  )
}

// ─── Past event card ──────────────────────────────────────────────────────────

function PastCard({ event }: { event: ChurchEvent }) {
  const { t } = useI18n()
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-32 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover grayscale-[40%] transition-all duration-300 group-hover:grayscale-0"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/15" />
        <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
          {t("evenementsPage.past_badge")}
        </span>
      </div>
      <div className="p-3">
        <CategoryBadge category={event.category} />
        <h4 className="mt-1.5 text-sm font-bold leading-snug text-cecj-green line-clamp-2">{event.title}</h4>
        <p className="mt-1 text-xs text-gray-400">{event.dateLabel}</p>
      </div>
    </div>
  )
}

// ─── Interactive calendar ─────────────────────────────────────────────────────

function EventCalendar({ events, locale }: { events: ChurchEvent[]; locale: string }) {
  const { t } = useI18n()
  const today  = new Date()
  const [year,        setYear]        = useState(today.getFullYear())
  const [month,       setMonth]       = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const MONTHS = locale === "en" ? MONTHS_EN : MONTHS_FR
  const DOWS   = locale === "en" ? DOW_EN    : DOW_FR
  const grid   = useMemo(() => calendarGrid(year, month), [year, month])
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate())

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
    setSelectedDay(null)
  }
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
    setSelectedDay(null)
  }

  const selectedEvents = selectedDay ? eventsOnDay(events, year, month, selectedDay) : []

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between bg-cecj-green px-4 py-3">
        <button onClick={prev} aria-label="Mois précédent" className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15">
          <ChevronIcon direction="left" className="h-4 w-4" />
        </button>
        <p className="font-semibold text-white">{MONTHS[month]} {year}</p>
        <button onClick={next} aria-label="Mois suivant" className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15">
          <ChevronIcon direction="right" className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {DOWS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {grid.map((day, i) => {
          if (!day) return <div key={i} className="border-b border-r border-gray-50 p-1" />
          const dayEvents  = eventsOnDay(events, year, month, day)
          const iso        = toIso(year, month, day)
          const isToday    = iso === todayIso
          const isSelected = selectedDay === day
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 border-b border-r border-gray-50 py-2 transition-colors",
                isSelected  ? "bg-cecj-green"      :
                isToday     ? "bg-cecj-gold/10"    :
                              "hover:bg-gray-50"
              )}
            >
              <span className={cn(
                "text-xs font-medium sm:text-sm",
                isSelected ? "text-white"        :
                isToday    ? "font-bold text-cecj-green" :
                             "text-gray-700"
              )}>
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <span
                      key={j}
                      className={cn("h-1 w-1 rounded-full", isSelected ? "bg-cecj-gold" : dotColor(e.category))}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      <div className="min-h-[56px] border-t border-gray-100 p-4">
        {selectedDay === null ? (
          <p className="text-center text-xs text-gray-300">Sélectionne un jour pour voir les événements</p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-center text-sm text-gray-400">{t("evenementsPage.no_events_day")}</p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColor(e.category))} />
                <div>
                  <p className="text-sm font-semibold text-cecj-green">{e.title}</p>
                  <p className="text-xs text-gray-400">{e.time} · {e.location.split(",")[0]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonEventCard({ featured }: { featured?: boolean }) {
  return (
    <div className={cn("animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm", featured ? "h-64" : "flex h-24 gap-4 p-4")}>
      {featured ? (
        <div className="h-full w-full bg-gray-200" />
      ) : (
        <>
          <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EvenementsContent() {
  const { t, locale } = useI18n()
  const { data: events, isLoading, isError } = useEvents()

  const upcoming = useMemo(
    () => events.filter(isEventUpcoming).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events],
  )
  const past = useMemo(
    () => events.filter((e) => !isEventUpcoming(e)).sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [events],
  )

  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))), [events])

  const filteredUpcoming = activeCategory ? upcoming.filter((e) => e.category === activeCategory) : upcoming
  const filteredPast     = activeCategory ? past.filter((e) => e.category === activeCategory)     : past

  const nextEvent  = upcoming[0] ?? null
  const countdown  = useCountdown(nextEvent?.startDate ?? null)
  const whatsappUrl = CHURCH_INFO.socials.whatsappContact ?? "#"

  return (
    <main className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span variants={fadeUp} className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
              {t("evenementsPage.hero_badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {t("evenementsPage.hero_title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-white/70">
              {t("evenementsPage.hero_subtitle")}
            </motion.p>

            {/* Countdown vers le prochain événement */}
            {nextEvent && countdown && (
              <motion.div variants={fadeUp} className="pt-3">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cecj-gold/70">
                  {t("evenementsPage.countdown_label")} — {nextEvent.title}
                </p>
                <div className="flex justify-center gap-3 sm:gap-5">
                  {[
                    { value: countdown.d, label: t("evenementsPage.days")  },
                    { value: countdown.h, label: t("evenementsPage.hours") },
                    { value: countdown.m, label: t("evenementsPage.min")   },
                    { value: countdown.s, label: t("evenementsPage.sec")   },
                  ].map(({ value, label }) => (
                    <div key={label as string} className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:px-5 sm:py-3 backdrop-blur-sm">
                      <span className="tabular-nums text-2xl font-bold text-white sm:text-3xl">
                        {String(value).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Filtre catégories (sticky) ─────────────────────────── */}
      <div className="sticky top-[64px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 lg:px-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === null ? "bg-cecj-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {t("evenementsPage.filter_all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat ? "bg-cecj-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu principal : événements + calendrier ────────── */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:px-8">

        {isError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <span className="font-semibold">Données hors ligne</span>
            <span className="text-amber-600">— Impossible de contacter le serveur. Les événements affichés sont les données locales.</span>
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-10">

          {/* Colonne gauche : événements à venir */}
          <div>
            <motion.p {...inView()} variants={fadeUp} className="mb-6 text-sm font-semibold uppercase tracking-widest text-cecj-green/60">
              {isLoading
                ? "Chargement des événements…"
                : filteredUpcoming.length > 0
                  ? `${filteredUpcoming.length} événement${filteredUpcoming.length > 1 ? "s" : ""} à venir`
                  : t("events.noUpcoming")}
            </motion.p>

            {isLoading ? (
              <div className="space-y-5">
                <SkeletonEventCard featured />
                <SkeletonEventCard />
                <SkeletonEventCard />
              </div>
            ) : filteredUpcoming.length > 0 ? (
              <motion.div {...inView()} variants={stagger} className="space-y-5">
                {filteredUpcoming.map((event, i) => (
                  <motion.div key={event.id} variants={fadeUp}>
                    {i === 0 ? <FeaturedCard event={event} /> : <CompactCard event={event} />}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-400">{t("events.noUpcoming")}</p>
              </div>
            )}
          </div>

          {/* Colonne droite : calendrier sticky */}
          <div className="lg:sticky lg:top-[120px] lg:self-start space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-cecj-green/60">
              {t("evenementsPage.calendar_title")}
            </p>
            <EventCalendar events={events} locale={locale} />

            {/* Légende des catégories */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t("evenementsPage.categories_legend")}
              </p>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-2.5">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor(cat))} />
                    <span className="text-xs text-gray-600">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Événements passés ──────────────────────────────────── */}
      {filteredPast.length > 0 && (
        <section className="bg-gray-50 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <motion.div {...inView()} variants={fadeUp} className="mb-8">
              <span className="mb-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {t("evenementsPage.history_badge")}
              </span>
              <h2 className="text-2xl font-bold text-cecj-green sm:text-3xl">
                {t("evenementsPage.history_title")}
              </h2>
            </motion.div>

            <motion.div {...inView()} variants={stagger} className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredPast.map((event) => (
                <motion.div key={event.id} variants={scaleUp}>
                  <PastCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA Témoignage ─────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-14 sm:py-16">
        <motion.div {...inView()} variants={fadeIn} className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cecj-gold">
            Vous y étiez ?
          </p>
          <h2 className="mb-3 text-2xl font-bold text-cecj-green sm:text-3xl">
            Un de nos cultes ou événements a changé quelque chose dans votre vie ?
          </h2>
          <p className="mb-7 text-gray-500">
            Vos témoignages encouragent toute l'église. Quelques lignes suffisent.
          </p>
          <Link
            href={`/${locale}/temoignages`}
            className="inline-flex items-center gap-2 rounded-full bg-cecj-green px-7 py-3 text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Partager mon témoignage
          </Link>
        </motion.div>
      </section>

      {/* ── CTA WhatsApp ───────────────────────────────────────── */}
      <section className="bg-cecj-green py-16 sm:py-20">
        <motion.div {...inView()} variants={fadeIn} className="mx-auto max-w-2xl px-4 text-center lg:px-8">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {t("evenementsPage.cta_title")}
          </h2>
          <p className="mb-8 text-white/70">{t("evenementsPage.cta_subtitle")}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-cecj-gold px-8 py-3 text-sm font-semibold text-cecj-green transition-transform hover:scale-105"
          >
            {t("evenementsPage.cta_whatsapp")}
          </a>
        </motion.div>
      </section>

    </main>
  )
}
