import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { SITE_ROUTES, AUTH_ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "C.E.C.J. — Communauté des Eglise Camps de Jésus-Christ",
  description:
    "Bienvenue à la Communauté des Eglise Camps de Jésus-Christ. Découvrez notre vision, notre mission et rejoignez notre communauté.",
}

export default function AccueilPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-cecj-green px-4 text-center">
        {/* Halo décoratif */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="h-[600px] w-[600px] rounded-full bg-cecj-gold" />
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
            Une communauté fondée sur la Parole de Dieu, animée par le Saint-Esprit
            et tournée vers l'évangélisation mondiale.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={SITE_ROUTES.presentation}
              className="rounded-md bg-cecj-gold px-8 py-3 font-semibold text-cecj-green transition-opacity hover:opacity-90"
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Valeurs — Colombe, Croix, Globe, Bible */}
      <section className="bg-white py-20 px-4">
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

      {/* Vision & Mission */}
      <section className="bg-cecj-light py-20 px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-2">
          <div className="rounded-xl bg-cecj-green p-8 text-white">
            <span className="mb-3 inline-block rounded-full bg-cecj-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-gold">
              Notre Vision
            </span>
            <h3 className="mb-4 text-2xl font-bold">
              Une église à l'impact national et international
            </h3>
            <p className="text-white/80">
              Nous visons à construire une communauté chrétienne vivante, capable d'accompagner
              la croissance spirituelle de ses membres à travers plusieurs pays, villes et extensions.
            </p>
            <Link
              href={SITE_ROUTES.vision}
              className="mt-6 inline-block text-sm font-semibold text-cecj-gold underline-offset-4 hover:underline"
            >
              En savoir plus →
            </Link>
          </div>

          <div className="rounded-xl border border-cecj-muted bg-white p-8">
            <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cecj-green">
              Notre Mission
            </span>
            <h3 className="mb-4 text-2xl font-bold text-cecj-green">
              Évangéliser, former et envoyer
            </h3>
            <p className="text-gray-500">
              Notre mission est de partager l'Évangile de Jésus-Christ, former des disciples
              mûrs dans la foi et les envoyer dans le monde pour faire de même.
            </p>
            <Link
              href={SITE_ROUTES.mission}
              className="mt-6 inline-block text-sm font-semibold text-cecj-green underline-offset-4 hover:underline"
            >
              En savoir plus →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Rejoindre */}
      <section className="bg-cecj-gold py-16 px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-cecj-green">
          Rejoignez la communauté
        </h2>
        <p className="mb-8 text-cecj-green/80">
          Trouvez une extension près de chez vous ou contactez-nous.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={SITE_ROUTES.extensions}
            className="rounded-md bg-cecj-green px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Trouver une extension
          </Link>
          <Link
            href={SITE_ROUTES.evenements}
            className="rounded-md border border-cecj-green px-8 py-3 font-semibold text-cecj-green transition-colors hover:bg-cecj-green/10"
          >
            Voir les événements
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
