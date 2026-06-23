export type BookId =
  | "GEN" | "EXO" | "LEV" | "NUM" | "DEU"
  | "JOS" | "JDG" | "RUT" | "1SA" | "2SA" | "1KI" | "2KI"
  | "1CH" | "2CH" | "EZR" | "NEH" | "EST"
  | "JOB" | "PSA" | "PRO" | "ECC" | "SNG"
  | "ISA" | "JER" | "LAM" | "EZK" | "DAN"
  | "HOS" | "JOL" | "AMO" | "OBA" | "JON" | "MIC" | "NAH"
  | "HAB" | "ZEP" | "HAG" | "ZEC" | "MAL"
  | "MAT" | "MRK" | "LUK" | "JHN" | "ACT"
  | "ROM" | "1CO" | "2CO" | "GAL" | "EPH" | "PHP" | "COL"
  | "1TH" | "2TH" | "1TI" | "2TI" | "TIT" | "PHM"
  | "HEB" | "JAS" | "1PE" | "2PE" | "1JN" | "2JN" | "3JN" | "JUD" | "REV"

export type ReadingPlanId = "8months" | "6months" | "4months" | "3months" | "2months" | "1month"

export interface BibleBook {
  id: BookId
  nameFr: string
  nameEn: string
  chapters: number
  columnIndex: number   // 0–8
  orderInColumn: number // 0-based position within the column
}

export interface ReadingPlan {
  id: ReadingPlanId
  labelFr: string
  labelEn: string
  morningChapters: number
  afternoonChapters: number
  targetDays: number
}

export interface ChapterRef {
  bookId: BookId
  chapter: number          // 1-based
  chapterId: string        // e.g. "GEN_1"
}

// ─── 9-column reading plan — exactly as printed in the official guide ──────────
// Column order: left → right. Within each column: top → bottom.
// "1 et 2 Samuel", "1 et 2 Rois", "1et 2 Pierre" are split into individual books
// but appear consecutively in the same column position.

export const BIBLE_BOOKS: BibleBook[] = [
  // ── Column 1 ────────────────────────────────────────────────────────────────
  { id: "GEN", nameFr: "Genèse",        nameEn: "Genesis",        chapters: 50,  columnIndex: 0, orderInColumn: 0 },
  { id: "JOS", nameFr: "Josué",         nameEn: "Joshua",         chapters: 24,  columnIndex: 0, orderInColumn: 1 },
  { id: "1CH", nameFr: "1 Chroniques",  nameEn: "1 Chronicles",   chapters: 29,  columnIndex: 0, orderInColumn: 2 },
  { id: "JOB", nameFr: "Job",           nameEn: "Job",            chapters: 42,  columnIndex: 0, orderInColumn: 3 },
  { id: "ISA", nameFr: "Ésaïe",         nameEn: "Isaiah",         chapters: 66,  columnIndex: 0, orderInColumn: 4 },
  { id: "MAT", nameFr: "Matthieu",      nameEn: "Matthew",        chapters: 28,  columnIndex: 0, orderInColumn: 5 },
  { id: "ROM", nameFr: "Romains",       nameEn: "Romans",         chapters: 16,  columnIndex: 0, orderInColumn: 6 },
  // ── Column 2 ────────────────────────────────────────────────────────────────
  { id: "EXO", nameFr: "Exode",         nameEn: "Exodus",         chapters: 40,  columnIndex: 1, orderInColumn: 0 },
  { id: "JDG", nameFr: "Juges",         nameEn: "Judges",         chapters: 21,  columnIndex: 1, orderInColumn: 1 },
  { id: "2CH", nameFr: "2 Chroniques",  nameEn: "2 Chronicles",   chapters: 36,  columnIndex: 1, orderInColumn: 2 },
  { id: "PSA", nameFr: "Psaumes",       nameEn: "Psalms",         chapters: 150, columnIndex: 1, orderInColumn: 3 },
  { id: "JER", nameFr: "Jérémie",       nameEn: "Jeremiah",       chapters: 52,  columnIndex: 1, orderInColumn: 4 },
  { id: "MRK", nameFr: "Marc",          nameEn: "Mark",           chapters: 16,  columnIndex: 1, orderInColumn: 5 },
  { id: "1CO", nameFr: "1 Corinthiens", nameEn: "1 Corinthians",  chapters: 16,  columnIndex: 1, orderInColumn: 6 },
  // ── Column 3 ────────────────────────────────────────────────────────────────
  { id: "LEV", nameFr: "Lévitique",     nameEn: "Leviticus",      chapters: 27,  columnIndex: 2, orderInColumn: 0 },
  { id: "RUT", nameFr: "Ruth",          nameEn: "Ruth",           chapters: 4,   columnIndex: 2, orderInColumn: 1 },
  { id: "EZR", nameFr: "Esdras",        nameEn: "Ezra",           chapters: 10,  columnIndex: 2, orderInColumn: 2 },
  { id: "PRO", nameFr: "Proverbes",     nameEn: "Proverbs",       chapters: 31,  columnIndex: 2, orderInColumn: 3 },
  { id: "LAM", nameFr: "Lamentations",  nameEn: "Lamentations",   chapters: 5,   columnIndex: 2, orderInColumn: 4 },
  { id: "LUK", nameFr: "Luc",           nameEn: "Luke",           chapters: 24,  columnIndex: 2, orderInColumn: 5 },
  { id: "2CO", nameFr: "2 Corinthiens", nameEn: "2 Corinthians",  chapters: 13,  columnIndex: 2, orderInColumn: 6 },
  // ── Column 4  (1 et 2 Samuel = two consecutive entries) ─────────────────────
  { id: "NUM", nameFr: "Nombres",       nameEn: "Numbers",        chapters: 36,  columnIndex: 3, orderInColumn: 0 },
  { id: "1SA", nameFr: "1 Samuel",      nameEn: "1 Samuel",       chapters: 31,  columnIndex: 3, orderInColumn: 1 },
  { id: "2SA", nameFr: "2 Samuel",      nameEn: "2 Samuel",       chapters: 24,  columnIndex: 3, orderInColumn: 2 },
  { id: "NEH", nameFr: "Néhémie",       nameEn: "Nehemiah",       chapters: 13,  columnIndex: 3, orderInColumn: 3 },
  { id: "ECC", nameFr: "Ecclésiaste",   nameEn: "Ecclesiastes",   chapters: 12,  columnIndex: 3, orderInColumn: 4 },
  { id: "EZK", nameFr: "Ézéchiel",      nameEn: "Ezekiel",        chapters: 48,  columnIndex: 3, orderInColumn: 5 },
  { id: "JHN", nameFr: "Jean",          nameEn: "John",           chapters: 21,  columnIndex: 3, orderInColumn: 6 },
  { id: "GAL", nameFr: "Galates",       nameEn: "Galatians",      chapters: 6,   columnIndex: 3, orderInColumn: 7 },
  // ── Column 5  (1 et 2 Rois = two consecutive entries) ───────────────────────
  { id: "DEU", nameFr: "Deutéronome",   nameEn: "Deuteronomy",    chapters: 34,  columnIndex: 4, orderInColumn: 0 },
  { id: "1KI", nameFr: "1 Rois",        nameEn: "1 Kings",        chapters: 22,  columnIndex: 4, orderInColumn: 1 },
  { id: "2KI", nameFr: "2 Rois",        nameEn: "2 Kings",        chapters: 25,  columnIndex: 4, orderInColumn: 2 },
  { id: "EST", nameFr: "Esther",        nameEn: "Esther",         chapters: 10,  columnIndex: 4, orderInColumn: 3 },
  { id: "SNG", nameFr: "Cantique des cantiques", nameEn: "Song of Songs", chapters: 8, columnIndex: 4, orderInColumn: 4 },
  { id: "DAN", nameFr: "Daniel",        nameEn: "Daniel",         chapters: 12,  columnIndex: 4, orderInColumn: 5 },
  { id: "ACT", nameFr: "Actes",         nameEn: "Acts",           chapters: 28,  columnIndex: 4, orderInColumn: 6 },
  { id: "EPH", nameFr: "Éphésiens",     nameEn: "Ephesians",      chapters: 6,   columnIndex: 4, orderInColumn: 7 },
  // ── Column 6 ────────────────────────────────────────────────────────────────
  { id: "HOS", nameFr: "Osée",          nameEn: "Hosea",          chapters: 14,  columnIndex: 5, orderInColumn: 0 },
  { id: "PHP", nameFr: "Philippiens",   nameEn: "Philippians",    chapters: 4,   columnIndex: 5, orderInColumn: 1 },
  { id: "JOL", nameFr: "Joël",          nameEn: "Joel",           chapters: 3,   columnIndex: 5, orderInColumn: 2 },
  { id: "COL", nameFr: "Colossiens",    nameEn: "Colossians",     chapters: 4,   columnIndex: 5, orderInColumn: 3 },
  { id: "AMO", nameFr: "Amos",          nameEn: "Amos",           chapters: 9,   columnIndex: 5, orderInColumn: 4 },
  { id: "1TH", nameFr: "1 Thessaloniciens", nameEn: "1 Thessalonians", chapters: 5, columnIndex: 5, orderInColumn: 5 },
  { id: "OBA", nameFr: "Abdias",        nameEn: "Obadiah",        chapters: 1,   columnIndex: 5, orderInColumn: 6 },
  // ── Column 7 ────────────────────────────────────────────────────────────────
  { id: "2TH", nameFr: "2 Thessaloniciens", nameEn: "2 Thessalonians", chapters: 3, columnIndex: 6, orderInColumn: 0 },
  { id: "JON", nameFr: "Jonas",         nameEn: "Jonah",          chapters: 4,   columnIndex: 6, orderInColumn: 1 },
  { id: "1TI", nameFr: "1 Timothée",    nameEn: "1 Timothy",      chapters: 6,   columnIndex: 6, orderInColumn: 2 },
  { id: "MIC", nameFr: "Michée",        nameEn: "Micah",          chapters: 7,   columnIndex: 6, orderInColumn: 3 },
  { id: "2TI", nameFr: "2 Timothée",    nameEn: "2 Timothy",      chapters: 4,   columnIndex: 6, orderInColumn: 4 },
  { id: "NAH", nameFr: "Nahum",         nameEn: "Nahum",          chapters: 3,   columnIndex: 6, orderInColumn: 5 },
  { id: "TIT", nameFr: "Tite",          nameEn: "Titus",          chapters: 3,   columnIndex: 6, orderInColumn: 6 },
  // ── Column 8 ────────────────────────────────────────────────────────────────
  { id: "HAB", nameFr: "Habacuc",       nameEn: "Habakkuk",       chapters: 3,   columnIndex: 7, orderInColumn: 0 },
  { id: "PHM", nameFr: "Philémon",      nameEn: "Philemon",       chapters: 1,   columnIndex: 7, orderInColumn: 1 },
  { id: "ZEP", nameFr: "Sophonie",      nameEn: "Zephaniah",      chapters: 3,   columnIndex: 7, orderInColumn: 2 },
  { id: "HEB", nameFr: "Hébreux",       nameEn: "Hebrews",        chapters: 13,  columnIndex: 7, orderInColumn: 3 },
  { id: "HAG", nameFr: "Aggée",         nameEn: "Haggai",         chapters: 2,   columnIndex: 7, orderInColumn: 4 },
  { id: "JAS", nameFr: "Jacques",       nameEn: "James",          chapters: 5,   columnIndex: 7, orderInColumn: 5 },
  { id: "ZEC", nameFr: "Zacharie",      nameEn: "Zechariah",      chapters: 14,  columnIndex: 7, orderInColumn: 6 },
  // ── Column 9  (1et 2 Pierre = two consecutive entries) ──────────────────────
  { id: "1PE", nameFr: "1 Pierre",      nameEn: "1 Peter",        chapters: 5,   columnIndex: 8, orderInColumn: 0 },
  { id: "2PE", nameFr: "2 Pierre",      nameEn: "2 Peter",        chapters: 3,   columnIndex: 8, orderInColumn: 1 },
  { id: "MAL", nameFr: "Malachie",      nameEn: "Malachi",        chapters: 4,   columnIndex: 8, orderInColumn: 2 },
  { id: "1JN", nameFr: "1 Jean",        nameEn: "1 John",         chapters: 5,   columnIndex: 8, orderInColumn: 3 },
  { id: "2JN", nameFr: "2 Jean",        nameEn: "2 John",         chapters: 1,   columnIndex: 8, orderInColumn: 4 },
  { id: "3JN", nameFr: "3 Jean",        nameEn: "3 John",         chapters: 1,   columnIndex: 8, orderInColumn: 5 },
  { id: "JUD", nameFr: "Jude",          nameEn: "Jude",           chapters: 1,   columnIndex: 8, orderInColumn: 6 },
  { id: "REV", nameFr: "Apocalypse",    nameEn: "Revelation",     chapters: 22,  columnIndex: 8, orderInColumn: 7 },
]

// Total = 1189 chapters ✓

export const READING_PLANS: Record<ReadingPlanId, ReadingPlan> = {
  "8months": {
    id: "8months",
    labelFr: "8 mois",
    labelEn: "8 months",
    morningChapters: 2,
    afternoonChapters: 3,
    targetDays: 238,
  },
  "6months": {
    id: "6months",
    labelFr: "6 mois",
    labelEn: "6 months",
    morningChapters: 4,
    afternoonChapters: 3,
    targetDays: 170,
  },
  "4months": {
    id: "4months",
    labelFr: "4 mois",
    labelEn: "4 months",
    morningChapters: 6,
    afternoonChapters: 4,
    targetDays: 119,
  },
  "3months": {
    id: "3months",
    labelFr: "3 mois",
    labelEn: "3 months",
    morningChapters: 10,
    afternoonChapters: 5,
    targetDays: 80,
  },
  "2months": {
    id: "2months",
    labelFr: "2 mois",
    labelEn: "2 months",
    morningChapters: 10,
    afternoonChapters: 10,
    targetDays: 60,
  },
  "1month": {
    id: "1month",
    labelFr: "1 mois",
    labelEn: "1 month",
    morningChapters: 20,
    afternoonChapters: 20,
    targetDays: 30,
  },
}

export const COLUMN_LABELS: Record<number, { fr: string; en: string }> = {
  0: { fr: "1ère colonne", en: "1st column" },
  1: { fr: "2ème colonne", en: "2nd column" },
  2: { fr: "3ème colonne", en: "3rd column" },
  3: { fr: "4ème colonne", en: "4th column" },
  4: { fr: "5ème colonne", en: "5th column" },
  5: { fr: "6ème colonne", en: "6th column" },
  6: { fr: "7ème colonne", en: "7th column" },
  7: { fr: "8ème colonne", en: "8th column" },
  8: { fr: "9ème colonne", en: "9th column" },
}

export const TOTAL_CHAPTERS = 1189

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flat list of all chapters in reading order (col 1→9, top→bottom within each col). */
export function buildFlatChapterList(): ChapterRef[] {
  const sorted = [...BIBLE_BOOKS].sort(
    (a, b) => a.columnIndex - b.columnIndex || a.orderInColumn - b.orderInColumn,
  )
  const refs: ChapterRef[] = []
  for (const book of sorted) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      refs.push({ bookId: book.id, chapter: ch, chapterId: `${book.id}_${ch}` })
    }
  }
  return refs
}

/** Chapters to read on day N (0-based) for a given plan. */
export function chaptersForDay(planId: ReadingPlanId, _dayIndex: number): number {
  switch (planId) {
    case "8months": return 5
    case "6months": return 7
    case "4months": return 10
    case "3months": return 15
    case "2months": return 20
    case "1month":  return 40
  }
}

/** Total chapters expected after D full days elapsed. */
export function expectedChaptersAfterDays(planId: ReadingPlanId, days: number): number {
  if (days <= 0) return 0
  switch (planId) {
    case "8months": return days * 5
    case "6months": return days * 7
    case "4months": return days * 10
    case "3months": return days * 15
    case "2months": return days * 20
    case "1month":  return days * 40
  }
}

/** Split today's chapters into morning / afternoon portions. */
export function splitMorningAfternoon(
  chapters: ChapterRef[],
  planId: ReadingPlanId,
  _dayIndex: number,
): { morning: ChapterRef[]; afternoon: ChapterRef[] } {
  const plan = READING_PLANS[planId]
  const morningCount = Math.min(plan.morningChapters, chapters.length)
  return {
    morning:   chapters.slice(0, morningCount),
    afternoon: chapters.slice(morningCount),
  }
}

export function getBookById(id: BookId): BibleBook {
  return BIBLE_BOOKS.find((b) => b.id === id)!
}

export function bookName(id: BookId, locale: "fr" | "en"): string {
  const book = getBookById(id)
  return locale === "fr" ? book.nameFr : book.nameEn
}
