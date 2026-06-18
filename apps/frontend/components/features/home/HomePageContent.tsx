"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { fadeUp, fadeIn, stagger, staggerSlow, scaleUp, inView } from "@/lib/motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { TestimonialsMarquee } from "./TestimonialsMarquee"
import { WeeklyProgramSection } from "./WeeklyProgramSection"
import { AmbianceCultesSection } from "./AmbianceCultesSection"
import { EventsSection } from "./EventsSection"
import { GalleryLightbox } from "./GalleryLightbox"


const GALLERY_PREVIEW_COUNT = 8
const GALLERY_MOBILE_COUNT = 4

// ── Static data (placeholder — à remplacer par API) ───────────────────────────

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

function GalerieImageCard({
  src,
  alt,
  onClick,
  extraCount,
  mobileExtraCount,
  className,
}: {
  src: string
  alt: string
  onClick: () => void
  extraCount?: number
  mobileExtraCount?: number
  className?: string
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={scaleUp}
      className={cn("group relative aspect-square overflow-hidden rounded-xl", className)}
    >
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
      {!!extraCount && extraCount > 0 && (
        <div className="absolute inset-0 hidden items-center justify-center bg-black/50 text-lg font-bold text-white sm:flex">
          +{extraCount}
        </div>
      )}
      {!!mobileExtraCount && mobileExtraCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white sm:hidden">
          +{mobileExtraCount}
        </div>
      )}
    </motion.button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HomePageContent({ galleryImages }: { galleryImages: string[] }) {
  const { locale, t } = useI18n()
  const lp = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)

  const valeurs = t("values.items") as Array<{ label: string; desc: string }>
  const temoignages = t("testimonials.items") as Array<{ texte: string; nom: string; role: string; initiales: string }>
  const piliers = t("vision.piliers") as string[]
  const missionItems = t("mission.items") as string[]
  const aboutCards = t("about.cards") as Array<{ label: string; desc: string }>
  const galleryPreview = galleryImages.slice(0, GALLERY_PREVIEW_COUNT)
  const remainingGalleryCount = Math.max(galleryImages.length - GALLERY_PREVIEW_COUNT, 0)
  const mobileRemainingCount = Math.max(galleryImages.length - GALLERY_MOBILE_COUNT, 0)

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

          <motion.div variants={fadeUp} className="mt-2 hidden w-full flex-col gap-3 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
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
              className="hidden sm:block sm:w-auto rounded-md border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-95"
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

      {/* ── Programme Hebdomadaire ───────────────────────────────────────── */}
      <WeeklyProgramSection />

      {/* ── Vision ───────────────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
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
        <div className="mx-auto max-w-4xl">
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
        <div className="mx-auto max-w-5xl">
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
              {t("about.p1_prefix")}{" "}
              <strong className="text-cecj-green">{t("about.p1_date")}</strong>
              {t("about.p1_suffix")}
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

      {/* ── Ambiance de nos cultes ───────────────────────────────────────── */}
      <AmbianceCultesSection />

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
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {galleryPreview.map((src, i) => (
              <GalerieImageCard
                key={src}
                src={src}
                alt={t("gallery.imageAlt")}
                onClick={() => setGalleryIndex(i)}
                className={i >= GALLERY_MOBILE_COUNT ? "max-sm:hidden" : undefined}
                extraCount={i === GALLERY_PREVIEW_COUNT - 1 ? remainingGalleryCount : undefined}
                mobileExtraCount={i === GALLERY_MOBILE_COUNT - 1 ? mobileRemainingCount : undefined}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <GalleryLightbox
        images={galleryImages}
        open={galleryIndex !== null}
        index={galleryIndex ?? 0}
        onClose={() => setGalleryIndex(null)}
      />

      {/* ── Événements ───────────────────────────────────────────────────── */}
      <EventsSection />

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      <section className="bg-cecj-page py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div className="mb-12 text-center" variants={stagger} {...inView()}>
            <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,203,50,0.9)" }}>
              {t("testimonials.pretitle")}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-cecj-green">
              {t("testimonials.title")}
            </motion.h2>
            <motion.div variants={fadeUp} className="mx-auto mt-4 h-px w-16" style={{ background: "linear-gradient(to right, transparent, #024339, transparent)" }} />
          </motion.div>
        </div>

        <motion.div variants={fadeIn} {...inView("-40px")}>
          <TestimonialsMarquee items={temoignages} />
        </motion.div>
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
              className="inline-block rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-cecj-green transition-all hover:opacity-90 hover:scale-[1.02] sm:px-10 sm:py-3 sm:text-base"
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
