"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { adminTestimoniesApi, type Testimony } from "@/lib/api/admin/testimonies"
import { TestimonyCard } from "@/components/features/home/TestimonialsMarquee"
import { stagger, fadeUp, inView } from "@/lib/motion"

const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const schema = z.object({
  fullName: z.string().min(2, "Votre nom est requis").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Votre numéro de téléphone est requis")
    .max(30, "Le numéro de téléphone est trop long")
    .regex(/^\+?[0-9\s().-]{7,30}$/, "Entrez un numéro de téléphone valide"),
  content:  z.string().min(20, "Le témoignage doit faire au moins 20 caractères").max(2000),
})
type FormValues = z.infer<typeof schema>

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
        <div className="h-3 w-4/6 rounded bg-gray-100" />
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-gray-50 pt-4">
        <div className="h-9 w-9 rounded-full bg-gray-100" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-2 w-16 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export function TemoignagesContent() {
  const [submitted, setSubmitted] = useState(false)
  const qc = useQueryClient()

  const { data: testimonies = [], isLoading } = useQuery<Testimony[]>({
    queryKey: ["public", "testimonies", "approved"],
    queryFn: adminTestimoniesApi.listApproved,
  })

  const submitMutation = useMutation({
    mutationFn: adminTestimoniesApi.submit,
    onSuccess: () => {
      setSubmitted(true)
      qc.invalidateQueries({ queryKey: ["public", "testimonies"] })
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      await submitMutation.mutateAsync({
        fullName: values.fullName,
        phone: values.phone,
        content: values.content,
      })
      reset()
    } catch {
      // Erreur déjà toastée par le MutationCache — le formulaire garde sa saisie.
    }
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span variants={fadeUp} className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
              La grâce de Dieu à l&apos;œuvre
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              Témoignages
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-xl text-lg text-white/70">
              Découvrez comment Dieu transforme des vies au sein de l'Église Camp de Jésus-Christ Bel-Air Fizi. Partagez votre propre témoignage.
            </motion.p>
            <motion.div variants={fadeUp} className="pt-2">
              <span className="text-3xl font-bold text-cecj-gold">{testimonies.length}</span>
              <span className="ml-2 text-sm font-semibold uppercase tracking-widest text-white/50">Témoignages partagés</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-3">

          {/* Formulaire de soumission */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="mb-1 text-xl font-bold text-cecj-green">Partagez votre témoignage</h2>
              <p className="mb-6 text-sm text-gray-500">
                Votre témoignage sera examiné par notre équipe avant publication.
              </p>

              {submitted ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-green-800">Merci pour votre témoignage !</p>
                  <p className="mt-1 text-sm text-green-600">Il sera publié après validation par notre équipe.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-4 text-sm font-semibold text-cecj-green underline underline-offset-2">
                    Partager un autre témoignage
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Votre nom *</label>
                    <input
                      {...register("fullName")}
                      className={cn(inputCls, errors.fullName && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                      placeholder="Jean Kalala"
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Votre numéro de téléphone *</label>
                    <input
                      {...register("phone")}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={cn(inputCls, errors.phone && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                      placeholder="+243 000 000 000"
                    />
                    <p className="text-xs text-gray-400">Ce numéro restera privé et servira uniquement à vous contacter.</p>
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Votre témoignage *</label>
                    <textarea
                      {...register("content")}
                      rows={6}
                      className={cn(inputCls, "resize-none", errors.content && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                      placeholder="Comment Dieu a-t-il transformé votre vie ?…"
                    />
                    {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                  </div>

                  {submitMutation.isError && (
                    <p className="text-xs text-red-500">Une erreur est survenue. Réessayez.</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-cecj-green py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isSubmitting ? "Envoi en cours…" : "Envoyer mon témoignage"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Grille des témoignages approuvés */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xl font-bold text-cecj-green">
              Témoignages de l'Église
            </h2>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : testimonies.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-400">Aucun témoignage publié pour le moment.</p>
              </div>
            ) : (
              <motion.div
                {...inView()}
                variants={stagger}
                className={cn(
                  "grid gap-6",
                  testimonies.length === 1 && "max-w-md",
                  testimonies.length >= 2  && "sm:grid-cols-2",
                  testimonies.length >= 4  && "lg:grid-cols-3",
                )}
              >
                {testimonies.map((t) => (
                  <motion.div key={t.id} variants={fadeUp}>
                    <TestimonyCard item={t} className="w-full" truncate={false} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
