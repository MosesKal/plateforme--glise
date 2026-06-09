import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "C.E.C.J. — Camp de Jésus Bel-Air",
  description:
    "Bienvenue au Camp de Jésus Bel-Air. Une communauté chrétienne fondée sur la saine doctrine du Seigneur Jésus-Christ, engagée dans la formation des disciples et la transformation des vies.",
}

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
  { day: "Mardi",    title: "Étude Biblique",           featured: false },
  { day: "Jeudi",    title: "Intercession et Prière",    featured: false },
  { day: "Dimanche", title: "Grand Culte d'Adoration",   featured: true  },
]

export default function AccueilPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden bg-cecj-green px-4 text-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="h-[700px] w-[700px] rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <Image
            src="/Logo C.E.C.j-BLANC.png"
            alt="Logo C.E.C.J."
            width={160}
            height={160}
            className="h-36 w-auto object-contain drop-shadow-2xl"
            priority
          />

          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Bienvenue au Camp de Jésus Bel-Air
          </h1>

          <p className="max-w-2xl text-lg text-white/80 leading-relaxed">
            Une communauté chrétienne fondée sur la saine doctrine du Seigneur Jésus-Christ,
            engagée dans la formation des disciples, la transformation des vies
            et la manifestation de l'amour de Dieu.
          </p>

          <p className="text-base italic text-white/60">
            &laquo;&nbsp;Christ en nous, l'espérance de la gloire.&nbsp;&raquo;
            <span className="ml-2 not-italic text-sm text-cecj-gold/80">— Colossiens 1:27</span>
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link
              href={SITE_ROUTES.presentation}
              className="rounded-md bg-white px-7 py-3 font-semibold text-cecj-green transition-opacity hover:opacity-90"
            >
              Découvrir l'Église
            </Link>
            <Link
              href={SITE_ROUTES.extensions}
              className="rounded-md border border-white/60 px-7 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Trouver une Extension
            </Link>
            <Link
              href={SITE_ROUTES.contact}
              className="rounded-md border border-white/30 px-7 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Nous Contacter
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Notre Vision ─────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-cecj-green">Notre Vision</h2>
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {["Formation", "Transformation", "Foi", "Amour"].map((pilier) => (
              <span
                key={pilier}
                className="rounded-full border border-cecj-gold/50 bg-cecj-gold/8 px-5 py-1.5 text-sm font-semibold text-cecj-green"
              >
                {pilier}
              </span>
            ))}
          </div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Nous croyons que l'Église est appelée à former des disciples matures,
            à transformer les vies par la puissance de l'Évangile, à développer une foi
            authentique et à manifester l'amour de Dieu dans toutes les sphères de la société.
          </p>
          <Link
            href={SITE_ROUTES.vision}
            className="mt-8 inline-block text-sm font-semibold text-cecj-green underline-offset-4 hover:underline"
          >
            En savoir plus sur notre vision →
          </Link>
        </div>
      </section>

      {/* ── Qui Sommes-Nous ? ─────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <div>
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
                className="rounded-md bg-cecj-green px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Notre histoire
              </Link>
              <Link
                href={SITE_ROUTES.mission}
                className="rounded-md border border-cecj-green px-6 py-3 text-sm font-semibold text-cecj-green transition-colors hover:bg-cecj-green hover:text-white"
              >
                Notre mission
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Saine Doctrine",   desc: "Fondés sur la Parole de Dieu" },
              { label: "Formation",        desc: "Des disciples matures dans la foi" },
              { label: "Restauration",     desc: "Des familles réconciliées" },
              { label: "Mission mondiale", desc: "Porteurs de l'Évangile partout" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white p-5 shadow-sm border border-cecj-muted">
                <p className="font-semibold text-cecj-green text-sm">{item.label}</p>
                <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nos Valeurs ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-cecj-green">Nos Valeurs</h2>
          <p className="mb-12 text-center text-gray-500">Ce qui guide chacun de nos pas</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {valeurs.map((valeur) => (
              <div
                key={valeur}
                className="group flex items-center justify-center rounded-xl border border-cecj-muted bg-cecj-light px-4 py-6 text-center transition-all hover:border-cecj-green hover:shadow-sm"
              >
                <p className="text-sm font-semibold text-cecj-green leading-snug">{valeur}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programme Hebdomadaire ───────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">Programme Hebdomadaire</h2>
          <p className="mb-12 text-center text-white/60">Rejoignez-nous chaque semaine</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {programme.map((item) => (
              <div
                key={item.day}
                className={`rounded-xl p-8 text-center flex flex-col items-center gap-4 ${
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Événements à venir ───────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold text-cecj-green">Événements à venir</h2>
              <p className="mt-1 text-gray-500">
                Conférences · Séminaires · Veillées · Campagnes · Retraites
              </p>
            </div>
            <Link
              href={SITE_ROUTES.evenements}
              className="shrink-0 rounded-md border border-cecj-green px-5 py-2 text-sm font-semibold text-cecj-green transition-colors hover:bg-cecj-green hover:text-white"
            >
              Voir tout l'agenda →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-cecj-muted bg-cecj-light transition-shadow hover:shadow-md"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nos Extensions ───────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
              Présence internationale
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-cecj-green">Nos Extensions</h2>
          <p className="mb-8 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Découvrez les différentes extensions de la C.E.C.J. à travers le monde
            et trouvez l'assemblée la plus proche de chez vous.
          </p>
          <Link
            href={SITE_ROUTES.extensions}
            className="inline-block rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Voir toutes les extensions →
          </Link>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-cecj-muted bg-cecj-light p-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-cecj-green">Dieu agit encore aujourd'hui.</h2>
            <p className="mb-8 text-lg text-gray-600 max-w-xl mx-auto">
              Découvrez comment des vies ont été transformées par la puissance de Jésus-Christ.
            </p>
            <Link
              href="#"
              className="inline-block rounded-md border border-cecj-green px-7 py-3 font-semibold text-cecj-green transition-colors hover:bg-cecj-green hover:text-white"
            >
              Lire les témoignages
            </Link>
          </div>
        </div>
      </section>

      {/* ── Galerie ──────────────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold text-cecj-green">Galerie</h2>
            <p className="text-gray-500">Revivez les moments marquants de notre communauté</p>
          </div>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Cultes", "Conférences", "Évangélisations", "Activités"].map((cat) => (
              <div
                key={cat}
                className="flex h-28 items-center justify-center rounded-xl bg-cecj-green/10 border border-cecj-green/20 text-sm font-semibold text-cecj-green"
              >
                {cat}
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href={SITE_ROUTES.galerie}
              className="inline-block rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Voir la galerie →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact Rapide ───────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold text-white leading-snug">
            Une question ?<br />
            Besoin de prière ?<br />
            Vous souhaitez nous rendre visite ?
          </h2>
          <p className="mb-8 text-cecj-gold/80 text-lg">
            Nous serons heureux de vous accueillir.
          </p>
          <Link
            href={SITE_ROUTES.contact}
            className="inline-block rounded-md bg-white px-10 py-3 font-semibold text-cecj-green transition-opacity hover:opacity-90"
          >
            Nous contacter
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
