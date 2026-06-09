"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES } from "@/constants/routes"

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

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
}

function inView(margin = "-80px") {
  return { initial: "hidden", whileInView: "visible", viewport: { once: true, margin } }
}

// ── Data ──────────────────────────────────────────────────────────────────────

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

const valeurs = [
  "Christ au centre",
  "La Parole de Dieu",
  "Le Saint-Esprit",
  "La Foi",
  "L'Amour",
  "L'Excellence",
  "Le Service",
  "L'Évangélisation",
]

const programme = [
  { day: "Mardi",    title: "Étude Biblique",         featured: false },
  { day: "Jeudi",    title: "Intercession et Prière",  featured: false },
  { day: "Dimanche", title: "Grand Culte d'Adoration", featured: true  },
]

const galerieImages = [
  { src: "/image_1.jpg",  alt: "Vie de la communauté" },
  { src: "/image_2.jpg",  alt: "Vie de la communauté" },
  { src: "/image_3.jpg",  alt: "Vie de la communauté" },
  { src: "/image_4.jpg",  alt: "Vie de la communauté" },
  { src: "/image_5.jpg",  alt: "Vie de la communauté" },
  { src: "/image_6.jpg",  alt: "Vie de la communauté" },
  { src: "/image_7.jpg",  alt: "Vie de la communauté" },
  { src: "/image_8.jpg",  alt: "Vie de la communauté" },
  { src: "/image_9.jpg",  alt: "Vie de la communauté" },
  { src: "/image_10.jpg", alt: "Vie de la communauté" },
]

const temoignages = [
  {
    id: 1,
    texte:
      "Depuis que j'ai rejoint cette communauté, ma vie a été transformée. La Parole de Dieu est enseignée avec clarté et profondeur. Je me sens vraiment chez moi.",
    nom: "Marie-Claire K.",
    role: "Membre depuis 3 ans",
    initiales: "MK",
  },
  {
    id: 2,
    texte:
      "J'ai trouvé ici une famille spirituelle sincère. Les moments de prière et d'intercession m'ont aidé à traverser des épreuves difficiles avec la force de Dieu.",
    nom: "Jean-Paul M.",
    role: "Membre depuis 5 ans",
    initiales: "JM",
  },
  {
    id: 3,
    texte:
      "Le Camp de Jésus Bel-Air m'a aidée à grandir dans ma foi. Les enseignements sont pratiques, ancrés dans la Bible et applicable au quotidien.",
    nom: "Esther N.",
    role: "Membre depuis 2 ans",
    initiales: "EN",
  },
  {
    id: 4,
    texte:
      "Dieu m'a guéri ici — pas seulement physiquement, mais intérieurement. Cette église croit vraiment en la puissance du Saint-Esprit et cela se voit.",
    nom: "Samuel B.",
    role: "Membre depuis 4 ans",
    initiales: "SB",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function HomePageContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        {/* Background — Next.js Image : WebP/AVIF auto + preload LCP */}
        <Image
          src="/background_image_1.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(2,67,57,0.88), rgba(2,67,57,0.80), rgba(2,67,57,0.93))" }}
        />

        {/* ── Couches décoratives ─────────────────────────────────────────── */}

        {/* Halo central doré — lumière spirituelle */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 50% at 50% 48%, rgba(255,203,50,0.12) 0%, rgba(255,255,255,0.05) 38%, transparent 68%)" }}
        />

        {/* Vignette — assombrit les coins pour focaliser le regard */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 45%, rgba(1,30,25,0.55) 100%)" }}
        />

        {/* Anneaux concentriques */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[740px] h-[740px] rounded-full border" style={{ borderColor: "rgba(255,255,255,0.04)" }} />
          <div className="absolute w-[580px] h-[580px] rounded-full border" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <div className="absolute w-[430px] h-[430px] rounded-full border" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
          <div className="absolute w-[290px] h-[290px] rounded-full border" style={{ borderColor: "rgba(255,203,50,0.12)" }} />
          <div className="absolute w-[170px] h-[170px] rounded-full border" style={{ borderColor: "rgba(255,203,50,0.18)" }} />
        </div>


        {/* Content */}
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
              className="h-32 w-auto object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Bienvenue au Camp de Jésus Bel-Air
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-2xl text-lg text-white/80 leading-relaxed">
            Une communauté chrétienne fondée sur la saine doctrine du Seigneur Jésus-Christ,
            engagée dans la formation des disciples, la transformation des vies
            et la manifestation de l'amour de Dieu.
          </motion.p>

          <motion.p variants={fadeUp} className="text-base italic text-white/60">
            &laquo;&nbsp;Christ en nous, l'espérance de la gloire.&nbsp;&raquo;
            <span className="ml-2 not-italic text-sm text-cecj-gold/80">— Colossiens 1:27</span>
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-2">
            <Link
              href={SITE_ROUTES.presentation}
              className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-cecj-green transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
            >
              Découvrir l'Église
            </Link>
            <Link
              href={SITE_ROUTES.extensions}
              className="rounded-md border border-white/60 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95"
            >
              Trouver une Extension
            </Link>
            <Link
              href={SITE_ROUTES.contact}
              className="rounded-md border border-white/30 px-5 py-2 text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-95"
            >
              Nous Contacter
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── Notre Vision ─────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <motion.div className="mx-auto max-w-4xl text-center" variants={stagger} {...inView()}>
          <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-cecj-green">
            Notre Vision
          </motion.h2>
          <motion.div variants={stagger} className="mb-8 flex flex-wrap justify-center gap-3">
            {["Formation", "Transformation", "Foi", "Amour"].map((pilier) => (
              <motion.span
                key={pilier}
                variants={scaleUp}
                className="rounded-full border border-cecj-gold/50 bg-cecj-gold/8 px-5 py-1.5 text-sm font-semibold text-cecj-green"
              >
                {pilier}
              </motion.span>
            ))}
          </motion.div>
          <motion.p variants={fadeUp} className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Nous croyons que l'Église est appelée à former des disciples matures,
            à transformer les vies par la puissance de l'Évangile, à développer une foi
            authentique et à manifester l'amour de Dieu dans toutes les sphères de la société.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href={SITE_ROUTES.vision}
              className="mt-8 inline-block text-sm font-semibold text-cecj-green underline-offset-4 hover:underline"
            >
              En savoir plus sur notre vision →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Qui Sommes-Nous ? ─────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <motion.div
          className="mx-auto max-w-6xl grid grid-cols-1 gap-12 md:grid-cols-2 items-center"
          variants={stagger}
          {...inView()}
        >
          <motion.div variants={fadeUp}>
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
              Qui Sommes-Nous ?
            </span>
            <h2 className="mb-6 text-3xl font-bold leading-snug text-cecj-green">
              Le Camp de Jésus Bel-Air
            </h2>
            <p className="mb-4 text-gray-600 leading-relaxed">
              Le Camp de Jésus Bel-Air est une communauté chrétienne ayant pour fondement
              la saine doctrine du Seigneur Jésus-Christ.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Notre mission est d'annoncer l'Évangile, d'édifier les croyants, de restaurer
              les familles et de préparer une génération de disciples engagés pour le Royaume de Dieu.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href={SITE_ROUTES.presentation}
                className="rounded-md bg-cecj-green px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              >
                Notre histoire
              </Link>
              <Link
                href={SITE_ROUTES.mission}
                className="rounded-md border border-cecj-green px-6 py-3 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02]"
              >
                Notre mission
              </Link>
            </div>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-2 gap-4">
            {[
              { label: "Saine Doctrine",   desc: "Fondés sur la Parole de Dieu" },
              { label: "Formation",        desc: "Des disciples matures dans la foi" },
              { label: "Restauration",     desc: "Des familles réconciliées" },
              { label: "Mission mondiale", desc: "Porteurs de l'Évangile partout" },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={scaleUp}
                className="rounded-xl bg-white p-5 shadow-sm border border-cecj-muted"
              >
                <p className="font-semibold text-cecj-green text-sm">{item.label}</p>
                <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Nos Valeurs ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center" variants={stagger} {...inView()}>
            <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold text-cecj-green">
              Nos Valeurs
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-12 text-gray-500">
              Ce qui guide chacun de nos pas
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {valeurs.map((valeur) => (
              <motion.div
                key={valeur}
                variants={scaleUp}
                className="group flex items-center justify-center rounded-xl border border-cecj-muted bg-cecj-light px-4 py-6 text-center transition-all hover:border-cecj-green hover:shadow-sm hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-cecj-green leading-snug">{valeur}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Programme Hebdomadaire ───────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center" variants={stagger} {...inView()}>
            <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold text-white">
              Programme Hebdomadaire
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-12 text-white/60">
              Rejoignez-nous chaque semaine
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
                className={`rounded-xl p-8 text-center flex flex-col items-center gap-4 transition-transform hover:-translate-y-1 ${
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
                    Culte principal
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Événements à venir ───────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            variants={fadeUp}
            {...inView()}
          >
            <div>
              <h2 className="text-3xl font-bold text-cecj-green">Événements à venir</h2>
              <p className="mt-1 text-gray-500">
                Conférences · Séminaires · Veillées · Campagnes · Retraites
              </p>
            </div>
            <Link
              href={SITE_ROUTES.evenements}
              className="shrink-0 rounded-md border border-cecj-green px-5 py-2 text-sm font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white"
            >
              Voir tout l'agenda →
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
                className="group flex flex-col overflow-hidden rounded-xl border border-cecj-muted bg-cecj-light transition-all hover:shadow-md hover:-translate-y-0.5"
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
                  <div className="mt-auto flex items-center gap-1.5 text-sm text-gray-500">
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
      <section className="bg-cecj-light px-4 py-20">
        <motion.div className="mx-auto max-w-4xl text-center" variants={stagger} {...inView()}>
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <span className="rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
              Présence internationale
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-bold text-cecj-green">
            Nos Extensions
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-10 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Découvrez les différentes extensions de la C.E.C.J. à travers le monde
            et trouvez l'assemblée la plus proche de chez vous.
          </motion.p>
        </motion.div>

        {/* Carte interactive */}
        <motion.div
          className="mx-auto max-w-5xl"
          variants={fadeUp}
          {...inView("-40px")}
        >
          <div className="overflow-hidden rounded-2xl border border-cecj-muted shadow-md" style={{ height: 420 }}>
            <ExtensionsMap />
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            Carte enrichie progressivement au fil des extensions — cliquez sur un marqueur pour plus d'informations.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} {...inView()} className="mt-8 text-center">
          <Link
            href={SITE_ROUTES.extensions}
            className="inline-block rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
          >
            Voir toutes les extensions →
          </Link>
        </motion.div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <motion.div className="mx-auto max-w-4xl" variants={scaleUp} {...inView()}>
          <div className="rounded-2xl border border-cecj-muted bg-cecj-light p-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-cecj-green">Dieu agit encore aujourd'hui.</h2>
            <p className="mb-8 text-lg text-gray-600 max-w-xl mx-auto">
              Découvrez comment des vies ont été transformées par la puissance de Jésus-Christ.
            </p>
            <Link
              href="#"
              className="inline-block rounded-md border border-cecj-green px-7 py-3 font-semibold text-cecj-green transition-all hover:bg-cecj-green hover:text-white hover:scale-[1.02]"
            >
              Lire les témoignages
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Galerie ──────────────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-10 text-center" variants={stagger} {...inView()}>
            <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold text-cecj-green">
              Galerie
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500">
              Revivez les moments marquants de notre communauté
            </motion.p>
          </motion.div>

          <motion.div
            className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {galerieImages.map((img, i) => (
              <motion.div
                key={img.src}
                variants={scaleUp}
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-cecj-green/0 transition-colors duration-300 group-hover:bg-cecj-green/30" />
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} {...inView()} className="text-center">
            <Link
              href={SITE_ROUTES.galerie}
              className="inline-block rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              Voir la galerie →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-12 text-center" variants={stagger} {...inView()}>
            <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,203,50,0.9)" }}>
              Ce que dit notre communauté
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-cecj-green">
              Témoignages
            </motion.h2>
            <motion.div variants={fadeUp} className="mx-auto mt-4 h-px w-16" style={{ background: "linear-gradient(to right, transparent, #024339, transparent)" }} />
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerSlow}
            {...inView("-40px")}
          >
            {temoignages.map((t) => (
              <motion.div
                key={t.id}
                variants={scaleUp}
                className="group relative flex flex-col rounded-2xl border border-gray-100 bg-cecj-light p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                {/* Guillemet décoratif */}
                <div
                  className="mb-3 font-serif text-6xl leading-none select-none"
                  style={{ color: "rgba(255,203,50,0.35)", lineHeight: 1 }}
                  aria-hidden
                >
                  &ldquo;
                </div>

                {/* Texte */}
                <p className="flex-1 text-sm leading-relaxed text-gray-600 italic">
                  {t.texte}
                </p>

                {/* Séparateur */}
                <div className="my-5 h-px w-10" style={{ background: "rgba(255,203,50,0.4)" }} />

                {/* Auteur */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "#024339" }}
                  >
                    {t.initiales}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cecj-green">{t.nom}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact Rapide ───────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-20 text-center">
        <motion.div className="mx-auto max-w-2xl" variants={stagger} {...inView()}>
          <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-bold text-white leading-snug">
            Une question ?<br />
            Besoin de prière ?<br />
            Vous souhaitez nous rendre visite ?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8 text-cecj-gold/80 text-lg">
            Nous serons heureux de vous accueillir.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href={SITE_ROUTES.contact}
              className="inline-block rounded-md bg-white px-10 py-3 font-semibold text-cecj-green transition-all hover:opacity-90 hover:scale-[1.02]"
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
