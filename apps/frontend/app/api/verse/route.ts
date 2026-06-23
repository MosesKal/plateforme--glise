import { NextRequest, NextResponse } from "next/server"

// getbible.net v2 — free, no key required
// Endpoint: /v2/{translation}/{book}/{chapter}.json  → returns { verses: [{verse, text, name}] }
const TRANSLATIONS: Record<string, string> = {
  fr: "ls1910", // Louis Segond 1910
  en: "kjv",    // King James Version
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const book    = searchParams.get("book")
  const chapter = searchParams.get("chapter")
  const verse   = searchParams.get("verse")
  const lang    = searchParams.get("lang") ?? "fr"

  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 })
  }

  const translation = TRANSLATIONS[lang] ?? "ls1910"
  const url = `https://api.getbible.net/v2/${translation}/${book}/${chapter}.json`

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache 24h côté Next.js
    })

    if (!res.ok) throw new Error(`getbible.net responded ${res.status}`)

    const data = await res.json() as { verses: { verse: number; text: string }[] }
    const verseNum = parseInt(verse, 10)
    const found = data.verses.find((v) => v.verse === verseNum)

    if (!found) throw new Error(`Verse ${verse} not found in chapter`)

    // LS1910 Psalm headings appear inline in verse 1 (e.g. "Cantique de David. L'Éternel...")
    // Strip everything up to and including the first period when followed by a capital letter
    const raw = found.text.trim()
    const text = raw.replace(/^[^.]+\.\s+(?=[A-ZÀ-Ÿ])/, "")

    return NextResponse.json(
      { text },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      },
    )
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 })
  }
}
