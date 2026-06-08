import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "C.E.C.J. — Communauté des Eglise Camps de Jésus-Christ",
  description:
    "Bienvenue au Camp de Jésus Bel-air. Une église fondée sur la saine doctrine du Seigneur Jésus — Formation, Transformation, Foi et Amour.",
}

// Événements placeholder — remplacés par l'API en v1
const upcomingEvents = [
  {
    id: 1,
    date: "Dim. 15 Juin 2026",
    type: "Culte dominical",
    title: "Culte d'adoration & enseignement",
    location: "Camp de Jésus Bel-air",
    time: "09h00",
  },
  {
    id: 2,
    date: "Sam. 21 Juin 2026",
    type: "Conférence",
    title: "Conférence : Marcher dans la Foi",
    location: "Camp de Jésus Bel-air",
    time: "15h00",
  },
  {
    id: 3,
    date: "Dim. 29 Juin 2026",
    type: "Évangélisation",
    title: "Sortie d'évangélisation en ville",
    location: "Rendez-vous au camp",
    time: "08h30",
  },
]

const quickLinks = [
  {
    label: "Extensions",
    desc: "Trouvez une communauté près de chez vous",
    href: SITE_ROUTES.extensions,
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    soon: false,
  },
  {
    label: "Événements",
    desc: "Agenda des cultes, conférences et rencontres",
    href: SITE_ROUTES.evenements,
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    soon: false,
  },
  {
    label: "Enseignements",
    desc: "Vidéos, audios et PDF des messages",
    href: "#",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    soon: true,
  },
  {
    label: "Galerie",
    desc: "Photos et médias de la communauté",
    href: SITE_ROUTES.galerie,
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    soon: false,
  },
]

export default function AccueilPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-cecj-green px-4 text-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="h-[600px] w-[600px] rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <Image
            src="/Logo C.E.C.j-BLANC.png"
            alt="Logo C.E.C.J."
            width={160}
            height={160}
            className="h-36 w-auto object-contain drop-shadow-2xl"
            priority
          />

          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Communauté des Eglise{" "}
            <span className="text-cecj-gold">Camps de Jésus-Christ</span>
          </h1>

          <p className="max-w-xl text-lg text-white/80">
            Une église fondée sur la saine doctrine du Seigneur Jésus,
            animée par le Saint-Esprit et tournée vers l'évangélisation mondiale.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={SITE_ROUTES.presentation}
              className="rounded-md bg-white px-8 py-3 font-semibold text-cecj-green transition-opacity hover:opacity-90"
            >
              Découvrir l'église
            </Link>
            <Link
              href={SITE_ROUTES.contact}
              className="rounded-md border border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Notre identité ───────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-cecj-green">
            Notre identité
          </h2>
          <p className="mb-12 text-center text-gray-500">
            Quatre symboles qui définissent qui nous sommes
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🕊️",
                title: "La Colombe",
                desc: "Le Saint-Esprit, la paix et la direction divine au cœur de notre communauté.",
              },
              {
                icon: "✝️",
                title: "La Croix",
                desc: "Jésus-Christ, le salut et la rédemption comme fondement de notre foi.",
              },
              {
                icon: "🌍",
                title: "Le Globe",
                desc: "L'évangélisation mondiale et notre mission internationale à travers nos extensions.",
              },
              {
                icon: "📖",
                title: "La Bible",
                desc: "La Parole de Dieu, l'enseignement biblique et notre fondement doctrinal.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-cecj-muted bg-cecj-light p-6 text-center shadow-sm"
              >
                <div className="mb-4 text-5xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-cecj-green">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ─────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-cecj-green">
            Vision & Mission
          </h2>
          <p className="mb-12 text-center text-gray-500">
            Ce qui nous guide et nous rassemble
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Vision */}
            <div className="flex flex-col rounded-xl bg-cecj-green p-8 text-white">
              <span className="mb-4 inline-block self-start rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                Notre Vision
              </span>
              <h3 className="mb-6 text-2xl font-bold leading-snug">
                Formation · Transformation · Foi · Amour
              </h3>
              <p className="flex-1 text-white/80">
                Nous visons à construire une communauté chrétienne vivante où chaque
                membre est formé dans la Parole, transformé par l'Esprit, affermi dans
                la foi et uni par l'amour de Christ.
              </p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex flex-wrap gap-2">
                  {["Formation", "Transformation", "Foi", "Amour"].map((pilier) => (
                    <span
                      key={pilier}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      {pilier}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={SITE_ROUTES.vision}
                className="mt-6 inline-block text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                En savoir plus →
              </Link>
            </div>

            {/* Mission */}
            <div className="flex flex-col rounded-xl border border-cecj-muted bg-white p-8">
              <span className="mb-4 inline-block self-start rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
                Notre Mission
              </span>
              <h3 className="mb-6 text-2xl font-bold leading-snug text-cecj-green">
                Évangéliser, former et envoyer
              </h3>
              <p className="flex-1 text-gray-500">
                Bienvenue au Camp de Jésus Bel-air. Nous sommes une église ayant pour
                fondement la saine doctrine du Seigneur Jésus. Notre mission est de
                partager l'Évangile, former des disciples mûrs dans la foi et les
                envoyer dans le monde pour faire de même.
              </p>
              <Link
                href={SITE_ROUTES.mission}
                className="mt-6 inline-block text-sm font-semibold text-cecj-green underline-offset-4 hover:underline"
              >
                En savoir plus →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Verset ───────────────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-3xl font-bold italic leading-relaxed text-white md:text-4xl">
            &ldquo;Christ en nous,{" "}
            <span className="text-cecj-gold">l'espérance de la gloire.&rdquo;</span>
          </p>
          <p className="mt-4 text-sm font-medium tracking-widest text-white/50 uppercase">
            Colossiens 1 : 27
          </p>
        </div>
      </section>

      {/* ── Événements à venir ───────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold text-cecj-green">Événements à venir</h2>
              <p className="mt-1 text-gray-500">Retrouvez nos prochains cultes, conférences et rencontres</p>
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
                {/* Bandeau date */}
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

      {/* ── Accès rapide ─────────────────────────────────────────────────── */}
      <section className="bg-cecj-light px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-cecj-green">
            Explorer
          </h2>
          <p className="mb-12 text-center text-gray-500">
            Accédez rapidement aux sections importantes
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.soon ? "#" : item.href}
                className={`group relative flex flex-col items-start gap-4 rounded-xl border border-cecj-muted bg-white p-6 transition-all hover:border-cecj-green hover:shadow-md ${item.soon ? "cursor-default opacity-70" : ""}`}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="rounded-lg bg-cecj-green/10 p-3 text-cecj-green transition-colors group-hover:bg-cecj-green group-hover:text-white">
                    {item.icon}
                  </div>
                  {item.soon && (
                    <span className="rounded-full bg-cecj-green/10 px-2.5 py-0.5 text-xs font-semibold text-cecj-green">
                      Bientôt
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-cecj-green">{item.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                </div>
                {!item.soon && (
                  <span className="mt-auto text-sm font-semibold text-cecj-green/60 transition-colors group-hover:text-cecj-green">
                    Accéder →
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Rejoindre ────────────────────────────────────────────────── */}
      <section className="bg-cecj-green px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Rejoignez la communauté
        </h2>
        <p className="mb-8 text-white/70">
          Trouvez une extension près de chez vous ou contactez-nous.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={SITE_ROUTES.extensions}
            className="rounded-md bg-white px-8 py-3 font-semibold text-cecj-green transition-opacity hover:opacity-90"
          >
            Trouver une extension
          </Link>
          <Link
            href={SITE_ROUTES.contact}
            className="rounded-md border border-white/40 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Nous contacter
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
