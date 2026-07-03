"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { stagger, fadeUp, inView } from "@/lib/motion"
import { useAudioTeachings, useTeachingThemes } from "@/hooks/useTeachings"
import { ThemeCard } from "@/components/features/teachings/audio/ThemeCard"
import { AudioTeachingRow } from "@/components/features/teachings/audio/AudioTeachingRow"

export function EnseignementsContent() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "fr"

  const { data: themes = [], isLoading: themesLoading } = useTeachingThemes()
  const { data: recent } = useAudioTeachings({ sort: "recent", limit: 5 })

  const visibleThemes = themes.filter((t) => t._count.audioTeachings > 0)

  return (
    <div className="bg-white pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cecj-gold"
            >
              La Parole en tout temps
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              Enseignements
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-lg text-white/70 leading-relaxed"
            >
              Écoutez les enseignements de la C.E.C.J., organisés par thèmes.
              Lancez la lecture et continuez votre navigation — l&apos;écoute vous suit.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Thèmes */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <motion.div {...inView()} variants={stagger} className="space-y-8">
          <motion.div variants={fadeUp} className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Parcourir par thème</h2>
            <div className="h-1 w-10 rounded bg-cecj-gold" />
          </motion.div>

          {themesLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : visibleThemes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
              Les enseignements arrivent bientôt.
            </p>
          ) : (
            <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  href={`/${locale}/enseignements/audio/${theme.slug}`}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Ajouts récents */}
      {recent && recent.items.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-8 lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-8">
            <motion.div variants={fadeUp} className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Derniers enseignements</h2>
              <div className="h-1 w-10 rounded bg-cecj-gold" />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-3">
              {recent.items.map((teaching, index) => (
                <AudioTeachingRow
                  key={teaching.id}
                  teaching={teaching}
                  queue={recent.items}
                  index={index}
                />
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
