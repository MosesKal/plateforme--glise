"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import type {
  AdminTheme,
  AdminVideoTeaching,
  Speaker,
  TeachingStatus,
  VideoTeachingPayload,
} from "@/lib/api/admin/teachings"

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: VideoTeachingPayload) => Promise<void>
  video: AdminVideoTeaching | null
  themes: AdminTheme[]
  speakers: Speaker[]
}

/**
 * Édition d'une vidéo synchronisée : seuls les champs ÉDITORIAUX sont
 * modifiables. Le titre, la description et la vignette viennent de YouTube
 * et seraient écrasés à la prochaine sync — ils sont affichés en lecture seule.
 */
export function VideoTeachingFormModal({
  open,
  onClose,
  onSubmit,
  video,
  themes,
  speakers,
}: Props) {
  const [status, setStatus] = useState<TeachingStatus>("PUBLISHED")
  const [themeId, setThemeId] = useState("")
  const [speakerId, setSpeakerId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !video) return
    setStatus(video.status)
    setThemeId(video.theme?.id ?? "")
    setSpeakerId(video.speaker?.id ?? "")
    setSaving(false)
    setError(null)
  }, [open, video])

  if (!open || !video) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        status,
        themeId: themeId || null,
        speakerId: speakerId || null,
      })
    } catch {
      setError("Enregistrement impossible. Réessayez.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Catégoriser la vidéo</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          {/* Métadonnées YouTube — lecture seule */}
          <div className="flex gap-3 rounded-xl bg-gray-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`}
              alt=""
              className="h-16 w-28 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-gray-900">{video.title}</p>
              <p className="mt-1 text-xs text-gray-400">
                Titre et vignette gérés sur YouTube (réécrits à chaque sync).
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Statut
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TeachingStatus)} className={inputCls}>
              <option value="PUBLISHED">Publié</option>
              <option value="DRAFT">Brouillon</option>
              <option value="ARCHIVED">Archivé (masqué du site)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Thème
              </label>
              <select value={themeId} onChange={(e) => setThemeId(e.target.value)} className={inputCls}>
                <option value="">— Aucun —</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.nameFr}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Orateur
              </label>
              <select value={speakerId} onChange={(e) => setSpeakerId(e.target.value)} className={inputCls}>
                <option value="">— Aucun —</option>
                {speakers.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={saving} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
