"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES } from "@/constants/routes"
import { fadeUp, fadeIn, stagger, scaleUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { useQuery } from "@tanstack/react-query"
import { adminTestimoniesApi } from "@/lib/api/admin/testimonies"
import { TestimonySpotlight } from "./TestimonySpotlight"
import { WeeklyProgramSection } from "./WeeklyProgramSection"
import { TeachingsSection } from "./TeachingsSection"
import { EventsSection } from "./EventsSection"

const HERO_SLIDES = [
  "/img_prg_3.jpg",
  "/img_prg_1.jpg",
  "/image_3.jpg",
  "/img_prg_8.jpg",
] as const

// ── Static data (placeholder — à remplacer par API) ───────────────────────────

// ── Verses carousel ───────────────────────────────────────────────────────────

const TESTIMONY_VERSES = [
  {
    text: "Je publierai ton nom à mes frères, je te louerai au milieu de la grande assemblée.",
    ref: "Psaume 22:22",
  },
  {
    text: "À la loi et au témoignage ! Si l'on ne parle pas d'après cette parole, il n'y aura point d'aurore pour le peuple.",
    ref: "Ésaïe 8:20",
  },
  {
    text: "Ils l'ont vaincu à cause du sang de l'Agneau et à cause de la parole de leur témoignage.",
    ref: "Apocalypse 12:11",
  },
  {
    text: "Venez, écoutez, vous tous qui craignez Dieu, et je raconterai ce qu'il a fait pour mon âme.",
    ref: "Psaume 66:16",
  },
  {
    text: "Je ne mourrai point, mais je vivrai, et je raconterai les œuvres de l'Éternel.",
    ref: "Psaume 118:17",
  },
  {
    text: "Va dans ta maison, vers les tiens, et raconte-leur tout ce que le Seigneur t'a fait.",
    ref: "Marc 5:19",
  },
]

function AnimatedVerse() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONY_VERSES.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-3">
      <div className="relative min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="absolute text-sm italic leading-relaxed text-white/45"
          >
            &ldquo;{TESTIMONY_VERSES[idx].text}&rdquo;
            <span className="ml-1.5 not-italic font-medium text-cecj-gold/70">
              &mdash; {TESTIMONY_VERSES[idx].ref}
            </span>
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex gap-1.5">
        {TESTIMONY_VERSES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Verset ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === idx
                ? "w-6 bg-cecj-gold/70"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

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

// ── Component ─────────────────────────────────────────────────────────────────

export function HomePageContent() {
  const { locale, t } = useI18n()
  const shouldReduceMotion = useReducedMotion()
  const [heroSlide, setHeroSlide] = useState(0)
  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)

  const valeurs = t("values.items") as Array<{ label: string; desc: string }>
  const piliers = t("vision.piliers") as string[]

  const { data: temoignages = [] } = useQuery({
    queryKey: ["public", "testimonies", "approved"],
    queryFn: adminTestimoniesApi.listApproved,
  })

  const missionItems = t("mission.items") as string[]
  const aboutCards = t("about.cards") as Array<{ label: string; desc: string }>

  useEffect(() => {
    if (shouldReduceMotion) return

    const intervalId = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % HERO_SLIDES.length)
    }, 6500)

    return () => window.clearInterval(intervalId)
  }, [shouldReduceMotion])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden px-4 text-center sm:min-h-[95vh]">
        <div className="absolute inset-0" aria-hidden="true">
          {HERO_SLIDES.map((src, index) => (
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: heroSlide === index ? 1 : 0,
                scale: heroSlide === index && !shouldReduceMotion ? 1.045 : 1,
              }}
              transition={{
                opacity: { duration: shouldReduceMotion ? 0 : 1.4, ease: "easeInOut" },
                scale: { duration: 7.5, ease: "linear" },
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </motion.div>
          ))}
        </div>
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
              alt="Logo C.E.C.J.C."
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

        </motion.div>

        <div className="absolute bottom-5 z-20 flex items-center gap-2" aria-label="Choisir l’image du banner">
          {HERO_SLIDES.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setHeroSlide(index)}
              aria-label={`Afficher l’image ${index + 1}`}
              aria-current={heroSlide === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                heroSlide === index
                  ? "w-8 bg-cecj-gold"
                  : "w-3 bg-white/35 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
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
            { to: 20,   suffix: "+", labelKey: "stats.departments", count: true  },
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

      {/* ── Programme Hebdomadaire ───────────────────────────────────────── */}
      <WeeklyProgramSection />

      {/* ── Vision ───────────────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} {...inView()} className="mb-8">
            <h2 className="font-decorative text-4xl leading-none text-cecj-gold md:text-6xl lg:text-7xl">
              {t("apropos.vision_badge")}
            </h2>
          </motion.div>

          <motion.div
            className="grid items-center gap-10 md:grid-cols-2"
            variants={stagger}
            {...inView()}
          >
            {/* Piliers — premier sur mobile, droite sur desktop */}
            <motion.div variants={stagger} className="order-1 grid grid-cols-2 gap-3 md:order-2">
              {piliers.map((pilier) => (
                <motion.div
                  key={pilier}
                  variants={scaleUp}
                  className="flex items-center justify-center rounded-2xl border border-cecj-gold/25 bg-white/8 px-4 py-8 text-center"
                >
                  <p className="font-semibold text-white">{pilier}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Texte — second sur mobile, gauche sur desktop */}
            <motion.div variants={fadeUp} className="order-2 space-y-5 md:order-1">
              <p className="text-base text-white/80 leading-relaxed sm:text-lg">
                {t("vision.body")}
              </p>
              <Link
                href={lp(SITE_ROUTES.apropos) + "#vision"}
                className="inline-block text-sm font-semibold text-cecj-gold/80 underline-offset-4 hover:underline hover:text-cecj-gold"
              >
                {t("vision.link")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} {...inView()} className="mb-10">
            <h2 className="font-decorative text-4xl leading-none text-cecj-green md:text-5xl lg:text-6xl">
              {t("apropos.mission_badge")}
            </h2>
          </motion.div>

          <motion.ul className="space-y-3" variants={stagger} {...inView("-40px")}>
            {missionItems.slice(0, 3).map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-xl border border-cecj-rule bg-cecj-tint px-5 py-4"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cecj-gold/30">
                  <svg className="h-3 w-3 text-cecj-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-sm leading-relaxed text-cecj-ink sm:text-base">{item}</p>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} {...inView()} className="mt-8 text-center">
            <Link
              href={lp(SITE_ROUTES.apropos) + "#mission"}
              className="inline-block rounded-md border border-cecj-green px-5 py-2 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02] sm:px-8 sm:py-3"
            >
              {t("mission.link")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Valeurs ──────────────────────────────────────────────────────── */}
      <section className="bg-cecj-page px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} {...inView()} className="mb-10">
            <h2 className="font-decorative text-4xl leading-none text-cecj-green md:text-5xl lg:text-6xl">
              {t("apropos.valeurs_badge")}
            </h2>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3"
            variants={stagger}
            {...inView("-40px")}
          >
            {valeurs.slice(0, 6).map((valeur) => (
              <motion.span
                key={valeur.label}
                variants={scaleUp}
                className="rounded-full border border-cecj-rule bg-cecj-tint px-5 py-2.5 text-sm font-medium text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green/5"
              >
                {valeur.label}
              </motion.span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} {...inView()} className="mt-8 text-center">
            <Link
              href={lp(SITE_ROUTES.apropos) + "#valeurs"}
              className="inline-block rounded-md border border-cecj-green px-5 py-2 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02] sm:px-8 sm:py-3"
            >
              {t("values.link")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Qui sommes-nous ? ─────────────────────────────────────────────── */}
      <section className="bg-cecj-tint px-4 py-14 sm:py-20">
        <motion.div
          className="mx-auto max-w-6xl grid grid-cols-1 gap-12 md:grid-cols-2 items-center"
          variants={stagger}
          {...inView()}
        >
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="font-decorative text-3xl leading-none text-cecj-green md:text-5xl lg:text-6xl">
              {t("about.badge")}
            </h2>
            <p className="text-cecj-ink leading-relaxed">
              {t("about.summary")}
            </p>
            <Link
              href={lp(SITE_ROUTES.apropos) + "#histoire"}
              className="inline-block rounded-md bg-cecj-green px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] sm:px-6 sm:py-3"
            >
              {t("about.cta_history")}
            </Link>
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

      {/* ── Enseignements ────────────────────────────────────────────────── */}
      <TeachingsSection />

      {/* ── Événements ───────────────────────────────────────────────────── */}
      <EventsSection />

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      {temoignages.length > 0 && (
        <section className="bg-cecj-page py-16 sm:py-24">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,203,50,0.9)" }}>
              La grâce de Dieu à l&apos;œuvre
            </p>
            <h2 className="text-3xl font-bold text-cecj-green">
              Ce que Dieu accomplit dans nos vies
            </h2>
            <div className="mx-auto mt-4 h-px w-16" style={{ background: "linear-gradient(to right, transparent, #024339, transparent)" }} />
          </div>
          <TestimonySpotlight items={temoignages} />
        </section>
      )}

      {/* ── CTA Témoignage ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cecj-green py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cecj-gold/8 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
          <motion.div
            {...inView()}
            variants={stagger}
            className="flex flex-col items-center gap-10 text-center lg:flex-row lg:items-center lg:text-left lg:gap-16"
          >
            <motion.div variants={fadeUp} className="flex-1 space-y-5">
              <span className="inline-block rounded-full border border-cecj-gold/30 bg-cecj-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cecj-gold">
                Votre voix compte
              </span>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Dieu a changé votre vie ?<br />
                <span className="text-cecj-gold">Partagez-le.</span>
              </h2>
              <p className="text-base text-white/70 leading-relaxed">
                Vos témoignages encouragent d&apos;autres croyants et glorifient Dieu.
                Rejoignez l&apos;Église Camp de Jésus-Christ Bel-Air Fizi et partagez ce que le Seigneur a accompli dans votre vie.
              </p>
              <AnimatedVerse />
            </motion.div>

            <motion.div variants={scaleUp} className="shrink-0">
              <Link
                href={lp(SITE_ROUTES.temoignages)}
                className="inline-flex items-center gap-3 rounded-2xl bg-cecj-gold px-8 py-4 text-base font-bold text-cecj-green shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl"
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Partager mon témoignage
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Rapide ───────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-14 text-center sm:py-20">
        <motion.div className="mx-auto max-w-2xl" variants={stagger} {...inView()}>
          <motion.h2 variants={fadeUp} className="mb-4 text-2xl font-bold text-cecj-green leading-snug sm:text-3xl">
            Une question ?<br />
            Besoin de prière ?<br />
            Vous souhaitez nous rendre visite ?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8 text-gray-500 text-lg">
            Nous serons heureux de vous accueillir.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href={lp(SITE_ROUTES.contact)}
              className="inline-block rounded-full bg-cecj-green px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] sm:px-10 sm:py-3.5 sm:text-base"
            >
              Nous contacter
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  )
}
