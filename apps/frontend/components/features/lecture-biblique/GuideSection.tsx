"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { fadeUp, stagger, inView } from "@/lib/motion"

export function GuideSection() {
  const { t } = useI18n()
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <section className="bg-cecj-tint py-16 lg:py-20" id="guide-officiel">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <motion.div variants={stagger} {...inView()} className="space-y-10">
            {/* Header */}
            <motion.div variants={fadeUp} className="text-center">
              <span className="mb-3 inline-block rounded-full bg-cecj-green/10 px-4 py-1.5 text-sm font-semibold text-cecj-green">
                {t("lectureBibliquePage.guide_badge")}
              </span>
              <h2 className="mb-3 text-2xl font-bold text-gray-900 lg:text-3xl">
                {t("lectureBibliquePage.guide_title")}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
                {t("lectureBibliquePage.guide_desc")}
              </p>
            </motion.div>

            {/* Guide image */}
            <motion.div
              variants={fadeUp}
              className="group relative mx-auto max-w-3xl cursor-zoom-in overflow-hidden rounded-2xl border border-gray-100 shadow-lg transition-shadow hover:shadow-xl"
              onClick={() => setLightboxOpen(true)}
              role="button"
              aria-label={t("lectureBibliquePage.guide_zoom")}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
            >
              <Image
                src="/guide de lecture.png"
                alt="Guide de lecture biblique CECJC"
                width={900}
                height={640}
                className="w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
              {/* Zoom overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
                <span className="scale-75 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 opacity-0 shadow-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  🔍 {t("lectureBibliquePage.guide_zoom")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Guide agrandi"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] max-w-5xl overflow-auto rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src="/guide de lecture.png"
                alt="Guide de lecture biblique CECJC — agrandi"
                width={1400}
                height={1000}
                className="w-full rounded-xl object-contain"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Fermer"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
