"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { SITE_ROUTES } from "@/constants/routes"
import { CHURCH_INFO } from "@/constants/church"
import { fadeUp, fadeIn, stagger, scaleUp, inView } from "@/lib/motion"

const ICONS = {
  book:    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  target:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  heart:   "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  check:   "M5 13l4 4L19 7",
  star:    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  map:     "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0",
  users:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  calendar:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  phone:   "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  clock:   "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  pin:     "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
      {children}
    </span>
  )
}

function SectionTitle({
  label,
  subtitle,
}: {
  label: string
  subtitle?: string
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-decorative text-5xl leading-none text-cecj-gold md:text-6xl lg:text-7xl">
        {label}
      </h2>
      {subtitle && (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}

const APOTRE_IMAGES = [
  { src: "/about/apotre_1.jpg" },
  { src: "/about/apotre_2.jpg" },
  { src: "/about/apotre_3.jpg" },
  { src: "/about/apotre_4.jpg" },
]

export function AProposContent() {
  const { t, locale } = useI18n()

  const [activeImg, setActiveImg] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImg((i) => (i + 1) % APOTRE_IMAGES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  const lp = (path: string) => `/${locale}${path}`

  const missionItems  = t("mission.items")  as unknown as string[]
  const visionPiliers = t("vision.piliers") as unknown as string[]
  const valeurs       = t("values.items")   as unknown as { label: string; desc: string }[]

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_INFO.location.fullAddress)}`
  const whatsappUrl = CHURCH_INFO.socials.whatsappContact ?? CHURCH_INFO.socials.whatsappChannel ?? "#"
  const phoneClean = CHURCH_INFO.contact.phone.replace(/\s/g, "")

  return (
    <main className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cecj-green py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="space-y-6">
            <Badge>{t("apropos.hero_badge")}</Badge>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {t("apropos.hero_title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              {t("apropos.hero_subtitle")}
            </p>
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "2016",   label: t("stats.founded") },
              { value: "2 000+", label: t("stats.members") },
              { value: "50+",    label: t("stats.churches") },
              { value: "4",      label: t("stats.departments") },
            ].map((stat) => (
              <motion.div key={stat.label} variants={scaleUp} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold text-cecj-gold">{stat.value}</p>
                <p className="mt-1 text-xs text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Nav interne ───────────────────────────────────────────── */}
      <nav className="sticky top-[64px] z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-3 lg:px-8">
          {[
            { anchor: "apotre",  label: t("apropos.nav_apotre") },
            { anchor: "histoire", label: t("apropos.nav_histoire") },
            { anchor: "mission",  label: t("apropos.nav_mission") },
            { anchor: "vision",   label: t("apropos.nav_vision") },
            { anchor: "valeurs",  label: t("apropos.nav_valeurs") },
            { anchor: "contact",  label: t("apropos.nav_contact") },
          ].map(({ anchor, label }) => (
            <a
              key={anchor}
              href={`#${anchor}`}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-cecj-green/10 hover:text-cecj-green"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Pasteur ──────────────────────────────────────────────── */}
      <section id="apotre" className="overflow-hidden py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">

          {/* Section header centré */}
          <motion.div {...inView()} variants={fadeUp} className="mb-16 text-center">
            <h2 className="font-decorative text-5xl text-cecj-gold md:text-6xl lg:text-7xl">
              {t("apropos.apotre_badge")}
            </h2>
          </motion.div>

          {/* Bloc principal : photo + bio */}
          <div className="grid items-center gap-12 lg:grid-cols-5">

            {/* Carrousel photo */}
            <motion.div {...inView()} variants={fadeIn} className="relative lg:col-span-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl">
                {APOTRE_IMAGES.map((img, i) => (
                  <Image
                    key={img.src}
                    src={img.src}
                    alt={i === 0 ? t("apropos.apotre_name") : ""}
                    fill
                    className="object-cover object-top transition-opacity duration-1000"
                    style={{ opacity: i === activeImg ? 1 : 0 }}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority={i === 0}
                  />
                ))}
                {/* Indicateurs de position */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {APOTRE_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeImg ? "w-5 bg-cecj-gold" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Cadre décoratif or */}
              <div className="pointer-events-none absolute -bottom-3 -right-3 h-full w-full rounded-3xl border-2 border-cecj-gold/25" />
              <div className="absolute -left-3 -top-3 h-7 w-7 rounded-full bg-cecj-gold/50" />
            </motion.div>

            {/* Biographie */}
            <motion.div {...inView()} variants={stagger} className="space-y-6 lg:col-span-3">
              <motion.span
                variants={fadeUp}
                className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold"
              >
                {t("apropos.apotre_role")}
              </motion.span>

              <motion.h3
                variants={fadeUp}
                className="text-4xl font-bold leading-tight text-cecj-green md:text-5xl"
              >
                {t("apropos.apotre_name")}
              </motion.h3>

              <motion.div variants={fadeUp} className="h-1 w-16 rounded-full bg-cecj-gold" />

              <motion.p variants={fadeUp} className="leading-relaxed text-gray-600">
                {t("apropos.apotre_bio1")}
              </motion.p>
              <motion.p variants={fadeUp} className="leading-relaxed text-gray-600">
                {t("apropos.apotre_bio2")}
              </motion.p>

              {/* Stats rapides */}
              <motion.div variants={stagger} className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { value: "2016",   label: t("stats.founded") },
                  { value: "2 000+", label: t("stats.members") },
                ].map((s) => (
                  <motion.div
                    key={s.label}
                    variants={scaleUp}
                    className="rounded-2xl border border-cecj-gold/20 bg-cecj-green/5 p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-cecj-green">{s.value}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── Histoire ─────────────────────────────────────────────── */}
      <section id="histoire" className="bg-cecj-green/5 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-10">
            <SectionTitle
              label={t("apropos.histoire_badge")}
              subtitle={t("apropos.histoire_title")}
            />
          </motion.div>

          {/* Image de l'église */}
          <motion.div
            {...inView()}
            variants={fadeIn}
            className="relative mb-10 aspect-[21/8] overflow-hidden rounded-2xl shadow-lg"
          >
            <Image
              src="/eglise/633758773_122197796450573866_866679131900775809_n.jpg"
              alt="Église Camp de Jésus-Christ Bel-Air Fizi"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 80vw"
            />
            {/* Dégradé bas pour transition douce */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cecj-green/30 to-transparent" />
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3">
            <motion.div {...inView()} variants={fadeUp} className="space-y-5 leading-relaxed text-gray-600 md:col-span-2">
              <p>{t("apropos.histoire_p1")}</p>
              <p>{t("apropos.histoire_p2")}</p>
              <p>{t("apropos.histoire_p3")}</p>
            </motion.div>

            <motion.div {...inView()} variants={stagger} className="space-y-4">
              {[
                { icon: ICONS.calendar, label: t("apropos.histoire_founded_label"), value: t("apropos.histoire_founded_value") },
                { icon: ICONS.map,      label: t("apropos.histoire_location_label"), value: t("apropos.histoire_location_value") },
                { icon: ICONS.users,    label: t("apropos.histoire_leader_label"),   value: t("apropos.histoire_leader_value") },
              ].map(({ icon, label, value }) => (
                <motion.div key={label} variants={fadeUp} className="flex items-start gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cecj-green/10">
                    <Icon d={icon} className="h-5 w-5 text-cecj-green" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="mt-0.5 font-semibold text-cecj-green">{value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <section id="mission" className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-12">
            <SectionTitle label={t("apropos.mission_badge")} />
          </motion.div>

          <motion.ul {...inView()} variants={stagger} className="space-y-4">
            {missionItems.map((item, i) => (
              <motion.li key={i} variants={fadeUp} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cecj-gold/20">
                  <Icon d={ICONS.check} className="h-4 w-4 text-cecj-green" />
                </span>
                <p className="leading-relaxed text-gray-700">{item}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ── Vision ───────────────────────────────────────────────── */}
      <section id="vision" className="bg-cecj-green/5 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-16">
            <SectionTitle label={t("apropos.vision_badge")} />
          </motion.div>

          {/* Énoncé de vision */}
          <motion.div {...inView()} variants={fadeIn} className="relative mb-20">
            <span className="pointer-events-none absolute -left-2 -top-6 select-none font-decorative text-9xl leading-none text-cecj-gold/20">
              "
            </span>
            <p className="relative pl-6 text-lg font-medium italic leading-relaxed text-cecj-green md:text-xl lg:text-2xl">
              {t("vision.body")}
            </p>
          </motion.div>

          {/* 4 Piliers */}
          <motion.div
            {...inView()}
            variants={stagger}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {visionPiliers.map((pilier, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group flex flex-col gap-3 border-t-2 border-cecj-gold/30 pt-5 transition-colors hover:border-cecj-gold"
              >
                <div className="flex items-center justify-between">
                  <Icon
                    d={[ICONS.book, ICONS.heart, ICONS.star, ICONS.target][i]}
                    className="h-5 w-5 text-cecj-gold"
                  />
                  <span className="text-xl font-bold text-cecj-green/10">0{i + 1}</span>
                </div>
                <p className="font-semibold text-cecj-green">{pilier}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Valeurs ──────────────────────────────────────────────── */}
      <section id="valeurs" className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-12">
            <SectionTitle label={t("apropos.valeurs_badge")} />
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {valeurs.map((v, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cecj-gold/20">
                  <Icon d={ICONS.star} className="h-4 w-4 text-cecj-green" />
                </div>
                <p className="font-semibold text-cecj-green">{v.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────── */}
      <section id="contact" className="bg-cecj-green/5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div {...inView()} variants={fadeUp} className="mb-12 space-y-3">
            <SectionTitle label={t("apropos.contact_badge")} />
            <p className="max-w-xl text-gray-500">{t("apropos.contact_subtitle")}</p>
            <div className="flex items-center gap-2 pt-1 text-sm text-gray-500">
              <Icon d={ICONS.clock} className="h-4 w-4 shrink-0 text-cecj-green" />
              <span>{t("apropos.contact_hours_label")} : <span className="font-medium text-cecj-green">{t("apropos.contact_hours_value")}</span></span>
            </div>
          </motion.div>

          <motion.div {...inView()} variants={stagger} className="grid gap-4 sm:grid-cols-3">
            <motion.a
              variants={fadeUp}
              href={`tel:${phoneClean}`}
              className="flex items-center gap-4 rounded-2xl bg-cecj-green p-5 text-white transition-transform hover:scale-[1.02]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon d={ICONS.phone} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{t("footer.callUs")}</p>
                <p className="font-semibold">{CHURCH_INFO.contact.phone}</p>
              </div>
            </motion.a>

            <motion.a
              variants={fadeUp}
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-cecj-green/20 bg-white p-5 text-cecj-green transition-all hover:bg-cecj-green/5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cecj-green/10">
                <Icon d={ICONS.map} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cecj-green/60">{t("apropos.contact_map_label")}</p>
                <p className="font-semibold text-sm leading-snug">{CHURCH_INFO.location.fullAddress}</p>
              </div>
            </motion.a>

            <motion.a
              variants={fadeUp}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-[#25D366]/30 bg-white p-5 text-[#128C7E] transition-all hover:bg-[#25D366]/5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#128C7E]/70">{t("apropos.contact_whatsapp_label")}</p>
                <p className="font-semibold">WhatsApp</p>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────── */}
      <section className="bg-cecj-green py-20">
        <motion.div {...inView()} variants={fadeUp} className="mx-auto max-w-2xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{t("apropos.cta_title")}</h2>
          <p className="mt-4 text-white/70">{t("apropos.cta_subtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="rounded-full bg-cecj-gold px-6 py-3 text-sm font-semibold text-cecj-green transition-transform hover:scale-105"
            >
              {t("footer.callUs")}
            </a>
            <Link
              href={lp(SITE_ROUTES.extensions)}
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              {t("apropos.cta_extensions")}
            </Link>
          </div>
        </motion.div>
      </section>

    </main>
  )
}
