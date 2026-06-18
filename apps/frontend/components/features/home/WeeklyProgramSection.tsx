"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeUp, stagger, staggerSlow, scaleUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { CHURCH_INFO } from "@/constants/church"
import { WEEKLY_PROGRAM, type ProgramActivity } from "@/constants/weeklyProgram"
import { ClockIcon, FacebookIcon, YouTubeIcon } from "@/components/ui/icons"

const FRENCH_WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const DISPLAY_WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

function getTodayLabel() {
  return FRENCH_WEEKDAYS[new Date().getDay()]
}

function getYoutubeStatus(activity: ProgramActivity, today: string): "live" | "available" | "upcoming" | null {
  if (!activity.liveOnYoutube) return null
  if (activity.days.includes(today)) return "live"
  const todayIndex = DISPLAY_WEEK_DAYS.indexOf(today)
  const hasPastDay = activity.days.some((d) => DISPLAY_WEEK_DAYS.indexOf(d) < todayIndex)
  if (hasPastDay) return "available"
  return "upcoming"
}

function formatHeure(time: string) {
  return time.replace(":", "h")
}

function LiveBadge({ label }: { label: string }) {
  return (
    <a
      href={CHURCH_INFO.socials.youtube}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 self-start rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-red-600 transition-colors hover:bg-red-100"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      {label}
      <YouTubeIcon className="h-3.5 w-3.5" />
    </a>
  )
}

function VideoAvailableBadge({ label }: { label: string }) {
  return (
    <a
      href={CHURCH_INFO.socials.youtube}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 self-start rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-500 transition-colors hover:bg-gray-200"
    >
      <YouTubeIcon className="h-3.5 w-3.5 text-[#FF0000]" />
      {label}
    </a>
  )
}

function UpcomingBadge({ label, featured }: { label: string; featured?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
      featured
        ? "bg-white/10 text-white/70"
        : "bg-cecj-gold/15 text-cecj-green/70"
    )}>
      <YouTubeIcon className="h-3.5 w-3.5 text-[#FF0000]/70" />
      {label}
    </span>
  )
}

function ActivityCard({ activity, today }: { activity: ProgramActivity; today: string }) {
  const { t } = useI18n()
  const featured = activity.category === "Adoration"
  const youtubeStatus = getYoutubeStatus(activity, today)

  return (
    <motion.li
      variants={scaleUp}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6",
        featured
          ? "bg-cecj-green text-white ring-1 ring-cecj-gold/40"
          : "border border-cecj-rule bg-cecj-tint text-cecj-ink",
      )}
    >
      {youtubeStatus === "live" && <LiveBadge label={t("weeklyProgram.liveOnYoutube")} />}
      {youtubeStatus === "available" && <VideoAvailableBadge label={t("weeklyProgram.videoAvailable")} />}
      {youtubeStatus === "upcoming" && <UpcomingBadge label={t("weeklyProgram.upcomingLive")} featured={featured} />}

      <h3 className={cn("text-lg font-bold leading-snug", featured ? "text-white" : "text-cecj-green")}>
        {activity.title}
      </h3>

      <div className={cn("flex items-center gap-1.5 text-sm font-medium", featured ? "text-white/80" : "text-cecj-ink-faint")}>
        <ClockIcon className="h-4 w-4 shrink-0" />
        <time dateTime={activity.startTime}>{formatHeure(activity.startTime)}</time>
        <span aria-hidden>–</span>
        <time dateTime={activity.endTime}>{formatHeure(activity.endTime)}</time>
      </div>

      <ul className="flex flex-wrap gap-1.5" aria-label={t("weeklyProgram.daysLabel")}>
        {DISPLAY_WEEK_DAYS.map((day) => {
          const isConcerned = activity.days.includes(day)
          const isToday = day === today
          return (
            <li key={day}>
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  isConcerned
                    ? "bg-cecj-gold text-cecj-green"
                    : featured
                      ? "bg-white/10 text-white/40"
                      : "bg-cecj-tint text-cecj-ink-dim",
                  isToday && (isConcerned ? "ring-2 ring-cecj-green/60" : "ring-2 ring-cecj-gold/70")
                )}
              >
                {day.slice(0, 3)}
                {isToday && <span className="sr-only"> ({t("weeklyProgram.todayBadge")})</span>}
              </span>
            </li>
          )
        })}
      </ul>

      {activity.facebookPhotosAfter && (
        <div className={cn("flex items-start gap-2 text-xs leading-relaxed", featured ? "text-white/70" : "text-cecj-ink-faint")}>
          <FacebookIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#1877F2]" />
          <p>
            {t("weeklyProgram.facebookPhotosNote")}{" "}
            <a
              href={CHURCH_INFO.socials.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("font-semibold underline-offset-2 hover:underline", featured ? "text-white" : "text-cecj-green")}
            >
              {CHURCH_INFO.socials.facebookName}
            </a>
          </p>
        </div>
      )}
    </motion.li>
  )
}

export function WeeklyProgramSection() {
  const { t, locale } = useI18n()
  const today = getTodayLabel()

  return (
    <section
      aria-labelledby="weekly-program-heading"
      className="bg-cecj-page px-4 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div className="mb-8 text-center sm:mb-12" variants={stagger} {...inView()}>
          <motion.span
            variants={fadeUp}
            className="mb-4 inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/12 px-5 py-2 text-base font-bold uppercase tracking-widest text-cecj-green sm:text-lg"
          >
            {CHURCH_INFO.welcomeMessage}
          </motion.span>
          <motion.h2 id="weekly-program-heading" variants={fadeUp} className="text-3xl font-bold text-cecj-green sm:text-4xl">
            {t("weeklyProgram.title")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-base italic text-cecj-green/70">
            {CHURCH_INFO.slogan}
          </motion.p>
        </motion.div>

        <motion.ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          variants={staggerSlow}
          {...inView("-40px")}
        >
          {WEEKLY_PROGRAM.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} today={today} />
          ))}
        </motion.ul>
      </div>

    </section>
  )
}
