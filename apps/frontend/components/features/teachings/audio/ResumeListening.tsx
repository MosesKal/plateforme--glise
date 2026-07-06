"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  readRecentPlays,
  readSavedPosition,
  type RecentPlay,
} from "@/lib/recent-plays"
import { formatDuration } from "@/components/features/teachings/format"

interface ResumeEntry extends RecentPlay {
  positionSec: number
}

/**
 * Enseignements commencés mais non terminés (localStorage, propre à
 * l'appareil). Le clic mène à la page de l'enseignement : les données y sont
 * refetchées — l'historique local n'est jamais une source de vérité.
 */
export function ResumeListening() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "fr"

  // Lu après montage uniquement : localStorage n'existe pas au SSR et un
  // rendu serveur différent du client provoquerait une erreur d'hydratation.
  const [entries, setEntries] = useState<ResumeEntry[]>([])

  useEffect(() => {
    const inProgress = readRecentPlays()
      .map((play) => ({ ...play, positionSec: readSavedPosition(play.id) }))
      .filter(
        (play) =>
          play.positionSec > 30 &&
          (!play.durationSec || play.positionSec < play.durationSec * 0.95),
      )
      .slice(0, 4)
    setEntries(inProgress)
  }, [])

  if (entries.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Reprendre l&apos;écoute</h2>
          <div className="h-1 w-10 rounded bg-cecj-gold" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entries.map((entry) => {
            const progress = entry.durationSec
              ? Math.min((entry.positionSec / entry.durationSec) * 100, 100)
              : 0
            return (
              <Link
                key={entry.id}
                href={`/${locale}/enseignements/audio/${entry.themeSlug}/${entry.slug}`}
                className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-cecj-green/25 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cecj-green/10 text-cecj-green transition group-hover:bg-cecj-green group-hover:text-white">
                    <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{entry.title}</p>
                    <p className="truncate text-xs text-gray-400">
                      {entry.themeName} · repris à {formatDuration(entry.positionSec)}
                    </p>
                  </div>
                </div>
                {progress > 0 && (
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-cecj-gold"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
