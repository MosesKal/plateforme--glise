"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { uploadImage } from "@/lib/api/upload"
import { cn } from "@/lib/utils"
import type { GalleryAlbum, CreateGalleryItemPayload } from "@/lib/api/admin/gallery"

type FileStatus = "idle" | "uploading" | "done" | "error"

type FileEntry = {
  id: string
  file: File
  preview: string
  status: FileStatus
  url?: string
}

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (items: CreateGalleryItemPayload[]) => Promise<void>
  albums: GalleryAlbum[]
}

export function BulkUploadModal({ open, onClose, onComplete, albums }: Props) {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [albumId, setAlbumId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<string[]>([])

  // Reset state and revoke object URLs when modal closes
  useEffect(() => {
    if (!open) {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrlsRef.current = []
      setEntries([])
      setAlbumId("")
      setIsSubmitting(false)
      setGlobalError(null)
    }
  }, [open])

  const addFiles = useCallback((files: File[]) => {
    setGlobalError(null)
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
    const skipped = files.length - valid.length
    if (skipped > 0) {
      setGlobalError(`${skipped} fichier(s) ignoré(s) — seules les images ≤ 5 Mo sont acceptées.`)
    }
    if (valid.length === 0) return

    const newEntries: FileEntry[] = valid.map((file) => {
      const preview = URL.createObjectURL(file)
      previewUrlsRef.current.push(preview)
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview,
        status: "idle",
      }
    })
    setEntries((prev) => [...prev, ...newEntries])
  }, [])

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const handleSubmit = async () => {
    const pending = entries.filter((e) => e.status === "idle")
    if (pending.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    setGlobalError(null)

    setEntries((prev) =>
      prev.map((e) => (e.status === "idle" ? { ...e, status: "uploading" } : e))
    )

    // Track results locally to make decisions after all uploads
    const localResults: Array<{ id: string; url: string | null }> = []

    await Promise.allSettled(
      pending.map(async (entry) => {
        try {
          const url = await uploadImage(entry.file)
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: "done", url } : e))
          )
          localResults.push({ id: entry.id, url })
        } catch {
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: "error" } : e))
          )
          localResults.push({ id: entry.id, url: null })
        }
      })
    )

    const successItems: CreateGalleryItemPayload[] = localResults
      .filter((r) => r.url !== null)
      .map((r) => ({
        mediaUrl: r.url!,
        mediaType: "IMAGE" as const,
        albumId: albumId || undefined,
      }))

    const hasErrors = localResults.some((r) => r.url === null)

    if (successItems.length > 0) {
      try {
        await onComplete(successItems)
        if (!hasErrors) {
          setIsSubmitting(false)
          onClose()
          return
        }
        // Partial success: remove done entries, keep errors visible
        setEntries((prev) => prev.filter((e) => e.status === "error"))
      } catch {
        setGlobalError("Erreur lors de l'enregistrement en base de données.")
      }
    } else {
      setGlobalError("Tous les uploads ont échoué. Vérifiez votre connexion et réessayez.")
    }

    setIsSubmitting(false)
  }

  if (!open) return null

  const idleCount = entries.filter((e) => e.status === "idle").length
  const doneCount = entries.filter((e) => e.status === "done").length
  const errorCount = entries.filter((e) => e.status === "error").length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Importer plusieurs images</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">

          {/* Drop zone — masquée pendant l'upload */}
          {!isSubmitting && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-sm transition-colors",
                dragOver
                  ? "border-cecj-green bg-cecj-green/5 text-cecj-green"
                  : "border-gray-200 text-gray-400 hover:border-cecj-green hover:bg-cecj-green/5 hover:text-cecj-green",
              )}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="font-medium">Cliquer ou déposer des images</span>
              <span className="text-xs text-gray-300">JPG, PNG, GIF, WEBP · max 5 Mo par fichier</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Barre de progression globale */}
          {isSubmitting && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <div className="mb-2 flex items-center justify-between">
                <span>Upload en cours…</span>
                <span>
                  <span className="font-semibold text-cecj-green">{doneCount}</span>
                  {" / "}
                  {entries.length}
                  {errorCount > 0 && (
                    <span className="ml-2 text-red-500">{errorCount} erreur(s)</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-cecj-green transition-all"
                  style={{ width: `${entries.length > 0 ? ((doneCount + errorCount) / entries.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Message d'erreur global */}
          {globalError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {globalError}
            </p>
          )}

          {/* Grille de prévisualisation */}
          {entries.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {entries.map((entry) => (
                <div key={entry.id} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.preview} alt="" className="h-full w-full object-cover" />

                  {entry.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}

                  {entry.status === "done" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-cecj-green/50">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}

                  {entry.status === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-500/70 px-1">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-center text-[9px] font-semibold leading-tight text-white">Échec</span>
                    </div>
                  )}

                  {entry.status === "idle" && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeEntry(entry.id) }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sélecteur d'album */}
          {entries.length > 0 && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Album (optionnel — appliqué à toutes les images)
              </label>
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10 disabled:opacity-50"
              >
                <option value="">Aucun album</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={idleCount === 0 || isSubmitting}
              className="rounded-lg bg-cecj-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-cecj-green/90 disabled:opacity-50"
            >
              {isSubmitting
                ? "Import en cours…"
                : `Importer ${idleCount} image${idleCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
