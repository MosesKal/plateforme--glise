"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, staggerSlow, scaleUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { SITE_ROUTES } from "@/constants/routes"
import { CHURCH_EVENTS, isEventUpcoming, type ChurchEvent } from "@/constants/events"
import { ClockIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons"

function CalendarBadge({ day, month, compact }: { day: string; month: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center overflow-hidden rounded-lg border border-cecj-rule",
        compact ? "w-12" : "w-16"
      )}
    >
      <div
        className={cn(
          "w-full bg-cecj-green text-center font-bold uppercase tracking-wide text-white",
          compact ? "py-0.5 text-[8px]" : "py-1 text-[10px]"
        )}
      >
        {month}
      </div>
      <div
        className={cn(
          "w-full bg-cecj-page text-center font-bold text-cecj-green",
          compact ? "py-1 text-sm" : "py-1.5 text-lg"
        )}
      >
        {day}
      </div>
    </div>
  )
}

function FeaturedEventCard({ event }: { event: ChurchEvent }) {
  const { t } = useI18n()

  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-1 overflow-hidden rounded-2xl border border-cecj-rule bg-cecj-page shadow-sm sm:grid-cols-2"
    >
      <div className="relative h-40 sm:h-auto">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 639px) 100vw, 50vw"
        />
      </div>

      <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-8">
        <div className="flex items-center gap-3">
          <CalendarBadge day={event.day} month={event.month} />
          <span className="inline-block rounded-full bg-cecj-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cecj-red">
            {t("events.upcomingBadge")}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cecj-green/60">{event.category}</p>
          <h3 className="mt-1 text-xl font-bold leading-snug text-cecj-green sm:text-2xl">{event.title}</h3>
        </div>

        {event.organizer && <p className="text-sm text-cecj-ink-faint">{event.organizer}</p>}
        {event.speaker && (
          <p className="text-sm text-cecj-ink-faint">
            {t("events.speakerLabel")} <span className="font-semibold text-cecj-green">{event.speaker}</span>
          </p>
        )}

        <div className="flex flex-col gap-2 text-sm text-cecj-ink">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 shrink-0 text-cecj-green" />
            {event.dateLabel} · {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-cecj-green" />
            {event.location}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PastEventCard({ event }: { event: ChurchEvent }) {
  const { t } = useI18n()

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-cecj-rule bg-cecj-page shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-28 shrink-0 sm:h-36">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover grayscale-[35%] transition-all duration-300 group-hover:grayscale-0"
          sizes="(max-width: 639px) 80vw, (max-width: 1023px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/15" />
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {t("events.finishedBadge")}
        </span>
      </div>
      <div className="flex flex-1 items-start gap-3 p-4">
        <CalendarBadge day={event.day} month={event.month} compact />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cecj-green/50">{event.category}</p>
          <h4 className="mt-0.5 text-sm font-bold leading-snug text-cecj-green line-clamp-2">{event.title}</h4>
        </div>
      </div>
    </div>
  )
}

function PastEventsCarousel({ events }: { events: ChurchEvent[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.firstElementChild as HTMLElement | null
    const amount = (card?.offsetWidth ?? 280) + 16
    track.scrollBy({ left: direction * amount, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <motion.div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-1 pb-2"
        variants={staggerSlow}
        {...inView("-40px")}
      >
        {events.map((event) => (
          <motion.div
            key={event.id}
            variants={scaleUp}
            className="w-[72%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
          >
            <PastEventCard event={event} />
          </motion.div>
        ))}
      </motion.div>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="Précédent"
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cecj-rule bg-cecj-page text-cecj-green shadow-sm transition-colors hover:bg-cecj-green hover:text-white sm:flex"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="Suivant"
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cecj-rule bg-cecj-page text-cecj-green shadow-sm transition-colors hover:bg-cecj-green hover:text-white sm:flex"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export function EventsSection() {
  const { t, locale } = useI18n()

  const upcoming = CHURCH_EVENTS.filter(isEventUpcoming).sort((a, b) => a.startDate.localeCompare(b.startDate))
  const past = CHURCH_EVENTS.filter((event) => !isEventUpcoming(event)).sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <section className="bg-cecj-tint px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div className="mb-10 text-center sm:mb-12" variants={stagger} {...inView()}>
          <motion.span
            variants={fadeUp}
            className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green"
          >
            {t("events.badge")}
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-cecj-green sm:text-4xl">
            {t("events.title")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-cecj-ink-faint">
            {t("events.subtitle")}
          </motion.p>
        </motion.div>

        {upcoming.length > 0 ? (
          <motion.div className="flex flex-col gap-6" variants={stagger} {...inView("-40px")}>
            {upcoming.map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-cecj-ink-faint">{t("events.noUpcoming")}</p>
        )}

        {past.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <motion.p
              variants={fadeUp}
              {...inView()}
              className="mb-6 text-sm font-semibold uppercase tracking-widest text-cecj-green/60"
            >
              {t("events.pastTitle")}
            </motion.p>
            <PastEventsCarousel events={past} />
          </div>
        )}

        <motion.div variants={fadeUp} {...inView()} className="mt-10 text-center">
          <Link
            href={`/${locale}${SITE_ROUTES.evenements}`}
            className="inline-block rounded-md border border-cecj-green px-8 py-3 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02]"
          >
            {t("events.link")}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
