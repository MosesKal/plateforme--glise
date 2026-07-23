"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { leadersApi, type Leader } from "@/lib/api/leaders"
import { stagger, fadeUp, scaleUp, inView } from "@/lib/motion"

const ROLE_LABELS: Record<string, string> = {
  FOUNDER:       "Fondateur",
  SENIOR_PASTOR: "Pasteur Principal",
  PASTOR:        "Pasteur",
  ELDER:         "Ancien",
  DEACON:        "Diacre",
  WORSHIP_LEADER:"Responsable Louange",
  YOUTH_LEADER:  "Responsable Jeunesse",
  OTHER:         "Leadership",
}

function LeaderCard({ leader }: { leader: Leader }) {
  const roleLabel = leader.role ? (ROLE_LABELS[leader.role] ?? leader.role) : null

  return (
    <motion.div
      variants={scaleUp}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-lg"
    >
      <div className="relative h-72 overflow-hidden bg-cecj-green/10">
        {leader.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={leader.photoUrl}
            alt={`${leader.firstName} ${leader.lastName}`}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cecj-green to-cecj-green/60">
            <span className="text-6xl font-bold text-white/20">
              {leader.firstName[0]}{leader.lastName[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {roleLabel && (
          <div className="absolute bottom-4 left-4">
            <span className="rounded-full bg-cecj-gold px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cecj-green">
              {roleLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-gray-900">
          {leader.firstName} {leader.lastName}
        </h3>
        {leader.title && (
          <p className="mt-0.5 text-sm font-medium text-cecj-green">{leader.title}</p>
        )}
        {leader.bio && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-4">
            {leader.bio}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="h-72 bg-gray-100" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="h-3 w-1/3 rounded bg-gray-100" />
        <div className="space-y-1.5 pt-2">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
          <div className="h-3 w-4/6 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export function LeadershipContent() {
  const { data: leaders = [], isLoading } = useQuery<Leader[]>({
    queryKey: ["public", "leaders"],
    queryFn: leadersApi.list,
  })

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-cecj-red/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-6">
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cecj-gold"
            >
              Direction spirituelle
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold text-white md:text-5xl lg:text-6xl"
            >
              Notre Leadership
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg text-white/70 leading-relaxed"
            >
              Des hommes et des femmes appelés par Dieu pour guider, servir et bâtir
              l'Église Camp de Jésus-Christ Bel-Air Fizi.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Verse */}
      <section className="border-b border-gray-100 bg-cecj-gold/5 py-10">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={fadeUp}>
            <blockquote className="text-lg font-medium italic text-gray-700">
              &ldquo;Obéissez à ceux qui vous conduisent et soyez soumis à eux,
              car ils veillent sur vos âmes.&rdquo;
            </blockquote>
            <cite className="mt-3 block text-sm font-semibold text-cecj-green">
              Hébreux 13:17
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Leaders grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 lg:px-8">
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">
              Les profils de leadership seront bientôt disponibles.
            </p>
          </div>
        ) : (
          <motion.div
            {...inView()}
            variants={stagger}
            className={`grid gap-8 ${
              leaders.length === 1
                ? "max-w-sm mx-auto"
                : leaders.length === 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {leaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </motion.div>
        )}
      </section>

      {/* Vision CTA */}
      <section className="bg-gradient-to-br from-cecj-green to-cecj-green/80 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white">
              Rejoindre notre vision
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70">
              Ensemble, nous bâtissons un héritage pour les générations à venir.
            </motion.p>
            <motion.a
              variants={fadeUp}
              href="/contact"
              className="inline-block rounded-full bg-cecj-gold px-8 py-3 text-sm font-bold text-cecj-green transition-opacity hover:opacity-90"
            >
              Nous contacter
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
