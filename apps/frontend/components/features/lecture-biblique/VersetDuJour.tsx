"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/I18nProvider"
import { fadeUp, inView } from "@/lib/motion"

interface VerseRef {
  bookId: number   // bolls.life canonical book number (Genesis=1 … Revelation=66)
  chapter: number
  verse: number
  ref: string      // display reference ("Jean 3:16")
  refEn: string    // English display reference ("John 3:16")
  fallbackFr: string
  fallbackEn: string
}

// Louis Segond 1910 fallbacks — used if the API is unreachable
const VERSE_REFS: VerseRef[] = [
  {
    bookId: 43, chapter: 3, verse: 16,
    ref: "Jean 3:16", refEn: "John 3:16",
    fallbackFr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    fallbackEn: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  },
  {
    bookId: 50, chapter: 4, verse: 13,
    ref: "Philippiens 4:13", refEn: "Philippians 4:13",
    fallbackFr: "Je puis tout par celui qui me fortifie.",
    fallbackEn: "I can do all this through him who gives me strength.",
  },
  {
    bookId: 19, chapter: 23, verse: 1,
    ref: "Psaumes 23:1", refEn: "Psalm 23:1",
    fallbackFr: "L'Éternel est mon berger: je ne manquerai de rien.",
    fallbackEn: "The LORD is my shepherd; I shall not want.",
  },
  {
    bookId: 40, chapter: 6, verse: 33,
    ref: "Matthieu 6:33", refEn: "Matthew 6:33",
    fallbackFr: "Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.",
    fallbackEn: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
  },
  {
    bookId: 20, chapter: 3, verse: 5,
    ref: "Proverbes 3:5", refEn: "Proverbs 3:5",
    fallbackFr: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.",
    fallbackEn: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
  },
  {
    bookId: 47, chapter: 12, verse: 9,
    ref: "2 Corinthiens 12:9", refEn: "2 Corinthians 12:9",
    fallbackFr: "Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse.",
    fallbackEn: "My grace is sufficient for thee: for my strength is made perfect in weakness.",
  },
  {
    bookId: 19, chapter: 27, verse: 1,
    ref: "Psaumes 27:1", refEn: "Psalm 27:1",
    fallbackFr: "L'Éternel est ma lumière et mon salut: de qui aurais-je crainte?",
    fallbackEn: "The LORD is my light and my salvation; whom shall I fear?",
  },
  {
    bookId: 41, chapter: 9, verse: 23,
    ref: "Marc 9:23", refEn: "Mark 9:23",
    fallbackFr: "Tout est possible à celui qui croit.",
    fallbackEn: "If thou canst believe, all things are possible to him that believeth.",
  },
  {
    bookId: 50, chapter: 4, verse: 6,
    ref: "Philippiens 4:6", refEn: "Philippians 4:6",
    fallbackFr: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.",
    fallbackEn: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
  },
  {
    bookId: 58, chapter: 11, verse: 1,
    ref: "Hébreux 11:1", refEn: "Hebrews 11:1",
    fallbackFr: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas.",
    fallbackEn: "Now faith is the substance of things hoped for, the evidence of things not seen.",
  },
  {
    bookId: 55, chapter: 1, verse: 7,
    ref: "2 Timothée 1:7", refEn: "2 Timothy 1:7",
    fallbackFr: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.",
    fallbackEn: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
  },
  {
    bookId: 40, chapter: 11, verse: 28,
    ref: "Matthieu 11:28", refEn: "Matthew 11:28",
    fallbackFr: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
    fallbackEn: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  },
]

function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000)
}

export function VersetDuJour() {
  const { t, locale } = useI18n()
  const isFr = locale === "fr"

  const todayRef = useMemo(() => VERSE_REFS[dayOfYear() % VERSE_REFS.length], [])

  const [text, setText] = useState<string>(isFr ? todayRef.fallbackFr : todayRef.fallbackEn)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/verse?book=${todayRef.bookId}&chapter=${todayRef.chapter}&verse=${todayRef.verse}&lang=${locale}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { text: string }) => setText(data.text))
      .catch(() => setText(isFr ? todayRef.fallbackFr : todayRef.fallbackEn))
      .finally(() => setLoading(false))
  }, [todayRef, locale, isFr])

  const displayRef = isFr ? todayRef.ref : todayRef.refEn

  return (
    <motion.div {...inView()} initial="hidden" whileInView="visible">
      <motion.div variants={fadeUp} className="text-center">
        <span className="mb-4 inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/20 px-4 py-1.5 text-sm font-semibold text-cecj-gold">
          {t("lectureBibliquePage.verse_badge")}
        </span>

        <blockquote className="relative mx-auto max-w-2xl">
          {/* Opening quote mark */}
          <span
            className="pointer-events-none absolute -left-4 -top-6 font-decorative text-7xl text-white/20 select-none"
            aria-hidden="true"
          >
            "
          </span>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cecj-gold border-t-transparent" />
            </div>
          ) : (
            <p className="relative text-lg font-medium leading-relaxed text-white/90 lg:text-xl">
              {text}
            </p>
          )}

          <footer className="mt-4 text-sm font-semibold text-cecj-gold">
            — {displayRef}
          </footer>
        </blockquote>
      </motion.div>
    </motion.div>
  )
}
