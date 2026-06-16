"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { motion, type Variants, useInView } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/providers/I18nProvider"

const ExtensionsMap = dynamic(
  () => import("./ExtensionsMap").then((m) => m.ExtensionsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-cecj-green/10" />
    ),
  }
)

// ── Variants ──────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerSlow: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
}

function inView(margin = "-80px") {
  return { initial: "hidden", whileInView: "visible", viewport: { once: true, margin } }
}

// ── Static data (placeholder — à remplacer par API) ───────────────────────────

const upcomingEvents = [
  {
    id: 1,
    date: "Mar. 10 Juin 2026",
    type: "Étude Biblique",
    title: "Étude de la Parole — Épître aux Romains",
    location: "Camp de Jésus Bel-Air",
    time: "19h00",
  },
  {
    id: 2,
    date: "Sam. 21 Juin 2026",
    type: "Conférence",
    title: "Conférence : Marcher dans la Foi",
    location: "Camp de Jésus Bel-Air",
    time: "15h00",
  },
  {
    id: 3,
    date: "Dim. 29 Juin 2026",
    type: "Campagne d'évangélisation",
    title: "Sortie d'évangélisation en ville",
    location: "Rendez-vous au camp",
    time: "08h30",
  },
]

const galerieImages = [
  "/image_1.jpg", "/image_2.jpg", "/image_3.jpg", "/image_4.jpg", "/image_5.jpg",
  "/image_6.jpg", "/image_7.jpg", "/image_8.jpg", "/image_9.jpg", "/image_10.jpg",
]

// ── Sub-components ────────────────────────────────────────────────────────────

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1800
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * to))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, to])

  return <span ref={ref}>{current}{suffix}</span>
}

function GalerieImageCard({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <motion.div variants={scaleUp} className="group relative aspect-square overflow-hidden rounded-xl">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-cecj-green/10" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-all duration-500 group-hover:scale-110",
          loaded ? "opacity-100" : "opacity-0",
        )}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-cecj-green/0 transition-colors duration-300 group-hover:bg-cecj-green/30" />
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HomePageContent() {
  const { locale, t } = useI18n()
  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)

  const valeurs = t("values.items") as Array<{ label: string; desc: string }>
  const programme = t("programme.items") as Array<{ day: string; title: string; featured: boolean }>
  const temoignages = t("testimonials.items") as Array<{ texte: string; nom: string; role: string; initiales: string }>
  const piliers = t("vision.piliers") as string[]
  const missionItems = t("mission.items") as string[]
  const aboutCards = t("about.cards") as Array<{ label: string; desc: string }>

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden px-4 text-center sm:min-h-[95vh]">
        <Image
          src="/background_image_1.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(2,67,57,0.88), rgba(2,67,57,0.80), rgba(2,67,57,0.93))" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 50% at 50% 48%, rgba(255,203,50,0.12) 0%, rgba(255,255,255,0.05) 38%, transparent 68%)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 45%, rgba(1,30,25,0.55) 100%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[740px] h-[740px] rounded-full border" style={{ borderColor: "rgba(255,255,255,0.04)" }} />
          <div className="absolute w-[580px] h-[580px] rounded-full border" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <div className="absolute w-[430px] h-[430px] rounded-full border" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
          <div className="absolute w-[290px] h-[290px] rounded-full border" style={{ borderColor: "rgba(255,203,50,0.12)" }} />
          <div className="absolute w-[170px] h-[170px] rounded-full border" style={{ borderColor: "rgba(255,203,50,0.18)" }} />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeIn}>
            <Image
              src="/Logo C.E.C.j-BLANC.png"
              alt="Logo C.E.C.J."
              width={160}
              height={160}
              className="h-24 w-auto object-contain drop-shadow-2xl sm:h-32"
              priority
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-2xl text-base text-white/80 leading-relaxed sm:text-lg">
            {t("hero.subtitle")}
          </motion.p>

          <motion.p variants={fadeUp} className="text-base italic text-white/60">
            &laquo;&nbsp;{t("hero.quote")}&nbsp;&raquo;
            <span className="ml-2 not-italic text-sm text-cecj-gold/80">— {t("hero.quoteRef")}</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href={lp(SITE_ROUTES.presentation)}
              className="w-full rounded-md bg-white px-5 py-3 text-center text-sm font-semibold text-cecj-green transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95 sm:w-auto"
            >
              {t("hero.cta_discover")}
            </Link>
            <Link
              href={lp(SITE_ROUTES.extensions)}
              className="w-full rounded-md border border-white/60 px-5 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95 sm:w-auto"
            >
              {t("hero.cta_extensions")}
            </Link>
            <Link
              href={lp(SITE_ROUTES.contact)}
              className="w-full rounded-md border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-95 sm:w-auto"
            >
              {t("hero.cta_contact")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Chiffres clés ────────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-10 sm:py-12">
        <motion.div
          className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4"
          variants={stagger}
          {...inView()}
        >
          {[
            { to: 50,   suffix: "+", labelKey: "stats.churches",    count: true  },
            { to: 2000, suffix: "+", labelKey: "stats.members",     count: true  },
            { to: 4,    suffix: "+", labelKey: "stats.departments", count: true  },
            { to: 2016, suffix: "",  labelKey: "stats.founded",     count: false },
          ].map((stat) => (
            <motion.div key={stat.labelKey} variants={fadeUp}>
              <p className="text-3xl font-bold text-cecj-gold sm:text-4xl">
                {stat.count
                  ? <CountUp to={stat.to} suffix={stat.suffix} />
                  : `${stat.to}${stat.suffix}`
                }
              </p>
              <p className="mt-1 text-sm text-white/70">{t(stat.labelKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Notre Vision ─────────────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <motion.div className="mx-auto max-w-4xl text-center" variants={stagger} {...inView()}>
          <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-cecj-green">
            {t("vision.title")}
          </motion.h2>
          <motion.div variants={stagger} className="mb-8 flex flex-wrap justify-center gap-3">
            {piliers.map((pilier) => (
              <motion.span
                key={pilier}
                variants={scaleUp}
                className="rounded-full border border-cecj-gold/50 bg-cecj-gold/8 px-5 py-1.5 text-sm font-semibold text-cecj-green"
              >
                {pilier}
              </motion.span>
            ))}
          </motion.div>
          <motion.p variants={fadeUp} className="text-base text-cecj-ink leading-relaxed max-w-3xl mx-auto sm:text-lg">
            {t("vision.body")}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href={lp(SITE_ROUTES.vision)}
              className="mt-8 inline-block text-sm font-semibold text-cecj-green underline-offset-4 hover:underline"
            >
              {t("vision.link")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Notre Mission ────────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div className="mb-10 text-center" variants={stagger} {...inView()}>
            <motion.span
              variants={fadeUp}
              className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/70"
            >
              {t("mission.badge")}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white">
              {t("mission.title")}
            </motion.h2>
            <motion.div
              variants={fadeUp}
              className="mx-auto mt-4 h-px w-16"
              style={{ background: "rgba(255,203,50,0.4)" }}
            />
          </motion.div>

          <motion.ol className="flex flex-col gap-5" variants={staggerSlow} {...inView("-40px")}>
            {missionItems.map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                className="flex items-start gap-5 rounded-xl border border-white/8 bg-white/5 px-5 py-4"
              >
                <span
                  className="shrink-0 text-2xl font-bold leading-none sm:text-3xl"
                  style={{ color: "rgba(255,203,50,0.7)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="pt-0.5 text-sm leading-relaxed text-white/85 sm:text-base">{item}</p>
              </motion.li>
            ))}
          </motion.ol>

          <motion.div variants={fadeUp} {...inView()} className="mt-10 text-center">
            <Link
              href={lp(SITE_ROUTES.mission)}
              className="inline-block rounded-md border border-white/40 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02]"
            >
              {t("mission.link")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Qui Sommes-Nous ? ─────────────────────────────────────────────── */}
      <section className="bg-cecj-tint px-4 py-14 sm:py-20">
        <motion.div
          className="mx-auto max-w-6xl grid grid-cols-1 gap-12 md:grid-cols-2 items-center"
          variants={stagger}
          {...inView()}
        >
          <motion.div variants={fadeUp}>
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
              {t("about.badge")}
            </span>
            <h2 className="mb-6 text-3xl font-bold leading-snug text-cecj-green">
              {t("about.title")}
            </h2>
            <p className="mb-4 text-cecj-ink leading-relaxed">
              {t("about.p1_prefix")}{" "}
              <strong className="text-cecj-green">{t("about.p1_date")}</strong>
              {t("about.p1_suffix")}
            </p>
            <p className="text-cecj-ink leading-relaxed">
              {t("about.p2_prefix")}{" "}
              <strong className="text-cecj-green">{t("about.p2_apostle")}</strong>
              {t("about.p2_mid")}{" "}
              <strong className="text-cecj-green">{t("about.p2_members")}</strong>{" "}
              {t("about.p2_mid2")}{" "}
              <strong className="text-cecj-green">{t("about.p2_churches")}</strong>{" "}
              {t("about.p2_suffix")}
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href={lp(SITE_ROUTES.presentation)}
                className="rounded-md bg-cecj-green px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              >
                {t("about.cta_history")}
              </Link>
              <Link
                href={lp(SITE_ROUTES.mission)}
                className="rounded-md border border-cecj-green px-6 py-3 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02]"
              >
                {t("about.cta_mission")}
              </Link>
            </div>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-2 gap-4">
            {aboutCards.map((card) => (
              <motion.div
                key={card.label}
                variants={scaleUp}
                className="rounded-xl bg-cecj-panel p-4 shadow-sm border border-cecj-rule sm:p-5"
              >
                <p className="font-semibold text-cecj-green text-sm">{card.label}</p>
                <p className="mt-1 text-xs text-cecj-ink-faint">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Nos Valeurs ──────────────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center" variants={stagger} {...inView()}>
            <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold text-cecj-green">
              {t("values.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-12 text-cecj-ink-faint">
              {t("values.subtitle")}
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {valeurs.map((valeur) => (
              <motion.div
                key={valeur.label}
                variants={scaleUp}
                className="group flex flex-col rounded-xl border border-cecj-rule bg-cecj-tint p-4 transition-all hover:border-cecj-green hover:shadow-sm hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-cecj-green leading-snug">{valeur.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-cecj-ink-faint">{valeur.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Programme Hebdomadaire ───────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center" variants={stagger} {...inView()}>
            <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold text-white">
              {t("programme.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-12 text-white/60">
              {t("programme.subtitle")}
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
            variants={stagger}
            {...inView("-40px")}
          >
            {programme.map((item) => (
              <motion.div
                key={item.day}
                variants={scaleUp}
                className={`rounded-xl p-5 text-center flex flex-col items-center gap-4 transition-transform hover:-translate-y-1 sm:p-8 ${
                  item.featured
                    ? "bg-white text-cecj-green shadow-xl"
                    : "bg-white/10 text-white border border-white/10"
                }`}
              >
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${item.featured ? "text-cecj-green/60" : "text-white/50"}`}>
                    {item.day}
                  </p>
                  <p className={`text-lg font-bold leading-snug ${item.featured ? "text-cecj-green" : "text-white"}`}>
                    {item.title}
                  </p>
                </div>
                {item.featured && (
                  <span className="rounded-full border border-cecj-gold/50 bg-cecj-gold/15 px-3 py-1 text-xs font-semibold text-cecj-green">
                    {t("programme.badge")}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Événements à venir ───────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            variants={fadeUp}
            {...inView()}
          >
            <div>
              <h2 className="text-3xl font-bold text-cecj-green">{t("events.title")}</h2>
              <p className="mt-1 text-cecj-ink-faint">{t("events.subtitle")}</p>
            </div>
            <Link
              href={lp(SITE_ROUTES.evenements)}
              className="shrink-0 rounded-md border border-cecj-green px-5 py-3 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white"
            >
              {t("events.link")}
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
            variants={stagger}
            {...inView("-40px")}
          >
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={scaleUp}
                className="group flex flex-col overflow-hidden rounded-xl border border-cecj-rule bg-cecj-tint transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="bg-cecj-green px-5 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{event.date}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/80">
                    {event.time}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-cecj-green/60">
                    {event.type}
                  </span>
                  <h3 className="mb-3 text-base font-bold leading-snug text-cecj-green group-hover:underline">
                    {event.title}
                  </h3>
                  <div className="mt-auto flex items-center gap-1.5 text-sm text-cecj-ink-faint">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Nos Extensions ───────────────────────────────────────────────── */}
      <section className="bg-cecj-tint px-4 py-14 sm:py-20">
        <motion.div className="mx-auto max-w-4xl text-center" variants={stagger} {...inView()}>
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <span className="rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
              {t("extensions.badge")}
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-cecj-green">
            {t("extensions.title")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-10 text-base text-cecj-ink leading-relaxed max-w-2xl mx-auto sm:text-lg">
            {t("extensions.body")}
          </motion.p>
        </motion.div>

        <motion.div className="mx-auto max-w-5xl" variants={fadeUp} {...inView("-40px")}>
          <div className="h-[280px] overflow-hidden rounded-2xl border border-cecj-rule shadow-md sm:h-[380px] md:h-[420px]">
            <ExtensionsMap />
          </div>
          <p className="mt-3 text-center text-xs text-cecj-ink-dim">
            {t("extensions.mapCaption")}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} {...inView()} className="mt-8 text-center">
          <Link
            href={lp(SITE_ROUTES.extensions)}
            className="inline-block rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
          >
            {t("extensions.link")}
          </Link>
        </motion.div>
      </section>

      {/* ── Témoignages CTA ──────────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <motion.div className="mx-auto max-w-4xl" variants={scaleUp} {...inView()}>
          <div className="rounded-2xl border border-cecj-rule bg-cecj-tint p-6 text-center sm:p-10">
            <h2 className="mb-3 text-3xl font-bold text-cecj-green">{t("testimonialsCta.title")}</h2>
            <p className="mb-8 text-lg text-cecj-ink max-w-xl mx-auto">
              {t("testimonialsCta.body")}
            </p>
            <Link
              href="#"
              className="inline-block rounded-md border border-cecj-green px-7 py-3 font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02]"
            >
              {t("testimonialsCta.link")}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Galerie ──────────────────────────────────────────────────────── */}
      <section className="bg-cecj-tint px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-10 text-center" variants={stagger} {...inView()}>
            <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold text-cecj-green">
              {t("gallery.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-cecj-ink-faint">
              {t("gallery.subtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {galerieImages.map((src) => (
              <GalerieImageCard key={src} src={src} alt={t("gallery.imageAlt")} />
            ))}
          </motion.div>

          <motion.div variants={fadeUp} {...inView()} className="text-center">
            <Link
              href={lp(SITE_ROUTES.galerie)}
              className="inline-block rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              {t("gallery.link")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-12 text-center" variants={stagger} {...inView()}>
            <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,203,50,0.9)" }}>
              {t("testimonials.pretitle")}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-cecj-green">
              {t("testimonials.title")}
            </motion.h2>
            <motion.div variants={fadeUp} className="mx-auto mt-4 h-px w-16" style={{ background: "linear-gradient(to right, transparent, #024339, transparent)" }} />
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {temoignages.map((t_item, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                className="group relative flex flex-col rounded-2xl border border-cecj-rule bg-cecj-tint p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <div
                  className="mb-3 font-serif text-6xl leading-none select-none"
                  style={{ color: "rgba(255,203,50,0.35)", lineHeight: 1 }}
                  aria-hidden
                >
                  &ldquo;
                </div>
                <p className="flex-1 text-sm leading-relaxed text-cecj-ink italic">
                  {t_item.texte}
                </p>
                <div className="my-5 h-px w-10" style={{ background: "rgba(255,203,50,0.4)" }} />
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "#024339" }}
                  >
                    {t_item.initiales}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cecj-green">{t_item.nom}</p>
                    <p className="text-xs text-cecj-ink-dim">{t_item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact Rapide ───────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-14 text-center sm:py-20">
        <motion.div className="mx-auto max-w-2xl" variants={stagger} {...inView()}>
          <motion.h2 variants={fadeUp} className="mb-6 text-2xl font-bold text-white leading-snug sm:text-3xl">
            {t("contactSection.line1")}<br />
            {t("contactSection.line2")}<br />
            {t("contactSection.line3")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8 text-cecj-gold/80 text-lg">
            {t("contactSection.subtitle")}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href={lp(SITE_ROUTES.contact)}
              className="inline-block rounded-md bg-white px-10 py-3 font-semibold text-cecj-green transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              {t("contactSection.link")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  )
}
