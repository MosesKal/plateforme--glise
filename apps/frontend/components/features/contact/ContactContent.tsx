"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { contactApi, type ContactPayload } from "@/lib/api/contact"
import { stagger, fadeUp, inView } from "@/lib/motion"

const contactSchema = z.object({
  firstName: z.string().min(2, "Prénom requis (min. 2 caractères)"),
  lastName:  z.string().min(2, "Nom requis (min. 2 caractères)"),
  phone:     z.string().min(8, "Numéro de téléphone requis (min. 8 chiffres)"),
  subject:   z.string().optional(),
  message:   z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

function SuccessMessage({ onReset, temoignagesHref }: { onReset: () => void; temoignagesHref: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50 px-8 py-12 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cecj-green text-white">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Message envoyé !</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Merci de nous avoir contactés. Nous reviendrons vers vous dans les plus brefs délais.
      </p>

      <div className="mt-8 w-full border-t border-green-200 pt-8 space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          Dieu a accompli quelque chose dans votre vie ?
        </p>
        <p className="text-xs text-gray-400">
          Votre témoignage peut encourager toute l'église.
        </p>
        <Link
          href={temoignagesHref}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-cecj-green underline underline-offset-4 hover:opacity-80"
        >
          Partager mon témoignage
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <button
        onClick={onReset}
        className="mt-6 text-xs text-gray-400 underline underline-offset-4 hover:opacity-80"
      >
        Envoyer un autre message
      </button>
    </motion.div>
  )
}

function ContactForm() {
  const [sent, setSent] = useState(false)
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "fr"
  const temoignagesHref = `/${locale}/temoignages`

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const mutation = useMutation({
    mutationFn: (values: ContactPayload) => contactApi.send(values),
    onSuccess: () => {
      setSent(true)
      reset()
    },
  })

  if (sent) {
    return <SuccessMessage onReset={() => setSent(false)} temoignagesHref={temoignagesHref} />
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            Prénom <span className="text-cecj-red">*</span>
          </label>
          <input
            {...register("firstName")}
            placeholder="Jean"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/15"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            Nom <span className="text-cecj-red">*</span>
          </label>
          <input
            {...register("lastName")}
            placeholder="Dupont"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/15"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Téléphone <span className="text-cecj-red">*</span>
        </label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+243 81 000 0000"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/15"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Sujet <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          {...register("subject")}
          placeholder="Demande d'information, prière, visite..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/15"
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Message <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Écrivez votre message ici..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/15"
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {mutation.isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-xl bg-cecj-green py-3.5 text-sm font-bold text-white transition hover:bg-cecj-green/90 disabled:opacity-60"
      >
        {mutation.isPending ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  )
}

const INFO_ITEMS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Adresse",
    value: "13 Avenue Bondo, Q/Bel-Air Kilobelobe, Commune Kampemba\nRéférence Arrêt Fizi, Lubumbashi, Haut-Katanga, RDC",
    link: {
      href: "https://maps.google.com/?q=13+Avenue+Bondo+Bel-Air+Kilobelobe+Kampemba+Lubumbashi+Haut-Katanga+RDC",
      label: "Voir l'itinéraire →",
    },
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "Téléphone",
    value: "+243 810 531 035",
    link: {
      href: "tel:+243810531035",
      label: "Contact →",
    },
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Cultes",
    value: "Dimanche 09h00 & 11h00",
    link: null,
  },
]

export function ContactContent() {
  return (
    <div className="bg-white">
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
              Nous rejoindre
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold text-white md:text-5xl"
            >
              Contactez-nous
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-lg text-white/70 leading-relaxed"
            >
              Une question, une demande de prière ou simplement envie de nous rejoindre ?
              Nous sommes là pour vous.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Info sidebar */}
          <motion.div
            {...inView()}
            variants={stagger}
            className="lg:col-span-2 space-y-8"
          >
            <motion.div variants={fadeUp} className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Informations pratiques</h2>
              <div className="h-1 w-10 rounded bg-cecj-gold" />
            </motion.div>

            <div className="space-y-5">
              {INFO_ITEMS.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cecj-green/10 text-cecj-green">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-700 whitespace-pre-line">{item.value}</p>
                    {item.link && (
                      <a
                        href={item.link.href}
                        target={item.link.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="mt-1 inline-flex items-center text-xs font-bold text-cecj-green hover:opacity-70"
                      >
                        {item.link.label}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl bg-cecj-green/5 p-6 border border-cecj-green/10"
            >
              <p className="text-sm font-semibold text-cecj-green">
                Besoin d&apos;une prière urgente ?
              </p>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Utilisez le formulaire ci-contre en mentionnant{" "}
                <span className="font-semibold">«&nbsp;Prière&nbsp;»</span> dans le sujet.
                Notre équipe priera pour vous.
              </p>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.div
            {...inView()}
            variants={fadeUp}
            className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            <h2 className="mb-6 text-xl font-bold text-gray-900">Envoyer un message</h2>
            <ContactForm />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
