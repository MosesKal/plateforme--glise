"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const RINGS = [
  { size: 680, color: "rgba(255,255,255,0.04)" },
  { size: 520, color: "rgba(255,255,255,0.05)" },
  { size: 380, color: "rgba(255,255,255,0.07)" },
  { size: 250, color: "rgba(255,203,50,0.12)" },
  { size: 148, color: "rgba(255,203,50,0.20)" },
]

export function SplashLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-cecj-green"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Lueur radiale centrale */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(255,203,50,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
            }}
          />

          {/* Anneaux concentriques */}
          {RINGS.map(({ size, color }, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full border"
              style={{ width: size, height: size, borderColor: color }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.07, duration: 0.9, ease: "easeOut" }}
            />
          ))}

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.65, type: "spring", stiffness: 220, damping: 22 }}
          >
            <Image
              src="/Logo C.E.C.j-BLANC.png"
              alt="C.E.C.J."
              width={128}
              height={128}
              className="relative h-28 w-auto object-contain drop-shadow-[0_0_32px_rgba(255,203,50,0.25)]"
              priority
            />
          </motion.div>

          {/* Nom de l'église */}
          <motion.div
            className="relative mt-7 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.5, ease: "easeOut" }}
          >
            <p className="font-decorative text-4xl text-cecj-gold drop-shadow-md">
              Camp de Jésus-Christ
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Bel-Air Fizi
            </p>
          </motion.div>

          {/* Points de chargement */}
          <motion.div
            className="absolute bottom-12 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-cecj-gold/50"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
