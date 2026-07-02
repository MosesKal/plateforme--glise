"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { uploadImage } from "@/lib/api/upload"
import { cn } from "@/lib/utils"
import type {
  GalleryAlbum,
  GalleryItem,
  CreateGalleryItemPayload,
  UpdateGalleryItemPayload,
} from "@/lib/api/admin/gallery"

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  initialData?: GalleryItem | null
  albums: GalleryAlbum[]
  /** Création d'un ou plusieurs médias (les URLs des images sont déjà résolues). */
  onCreate: (items: CreateGalleryItemPayload[]) => Promise<void>
  /** Mise à jour d'un média existant. */
  onUpdate: (id: string, payload: UpdateGalleryItemPayload) => Promise<void>
}

export function GalleryItemFormModal({ open, onClose, initialData, albums, onCreate, onUpdate }: Props) {
  if (!open) return null
  const isEdit = !!initialData

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className={cn("w-full rounded-2xl bg-white shadow-2xl", isEdit ? "max-w-lg" : "max-w-2xl")}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier le média" : "Ajouter des médias"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isEdit ? (
          <EditForm initialData={initialData!} albums={albums} onUpdate={onUpdate} onClose={onClose} />
        ) : (
          <AddForm albums={albums} onCreate={onCreate} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────  ÉDITION (média unique)  ───────────────────────────── */

const editSchema = z.object({
  mediaUrl: z.string().min(1, "L'URL est requise"),
  title: z.string().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  albumId: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

type EditValues = z.infer<typeof editSchema>

function EditForm({
  initialData,
  albums,
  onUpdate,
  onClose,
}: {
  initialData: GalleryItem
  albums: GalleryAlbum[]
  onUpdate: (id: string, payload: UpdateGalleryItemPayload) => Promise<void>
  onClose: () => void
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<EditValues>({
      resolver: zodResolver(editSchema),
      defaultValues: {
        mediaUrl: initialData.mediaUrl,
        title: initialData.title ?? "",
        mediaType: initialData.mediaType,
        albumId: initialData.albumId ?? "",
        order: initialData.order,
      },
    })

  const mediaType = watch("mediaType")

  const submit = async (values: EditValues) => {
    await onUpdate(initialData.id, {
      mediaUrl: values.mediaUrl,
      title: values.title || undefined,
      mediaType: values.mediaType,
      albumId: values.albumId || null,
      order: values.order ?? 0,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 px-6 py-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type *" error={errors.mediaType?.message}>
          <select {...register("mediaType")} className={inputCls}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Vidéo</option>
          </select>
        </Field>
        <Field label="Ordre" error={errors.order?.message}>
          <input {...register("order", { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="0" />
        </Field>
      </div>

      {mediaType === "IMAGE" ? (
        <Field label="Image *" error={errors.mediaUrl?.message}>
          <ImageUpload
            value={watch("mediaUrl") ?? ""}
            onChange={(url) => setValue("mediaUrl", url, { shouldValidate: true })}
          />
        </Field>
      ) : (
        <Field label="URL de la vidéo *" error={errors.mediaUrl?.message}>
          <input {...register("mediaUrl")} className={inputCls} placeholder="https://youtube.com/watch?v=…" />
        </Field>
      )}

      <Field label="Titre / légende" error={errors.title?.message}>
        <input {...register("title")} className={inputCls} placeholder="Description optionnelle…" />
      </Field>

      <Field label="Album" error={errors.albumId?.message}>
        <select {...register("albumId")} className={inputCls}>
          <option value="">Aucun album</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </Field>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
        <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
          Enregistrer
        </Button>
      </div>
    </form>
  )
}

/* ─────────────────────────────  AJOUT (un ou plusieurs médias)  ───────────────────────────── */

type FileStatus = "idle" | "uploading" | "done" | "error"

type FileEntry = {
  id: string
  file: File
  preview: string
  status: FileStatus
  url?: string
}

function AddForm({
  albums,
  onCreate,
  onClose,
}: {
  albums: GalleryAlbum[]
  onCreate: (items: CreateGalleryItemPayload[]) => Promise<void>
  onClose: () => void
}) {
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE")
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [videoUrl, setVideoUrl] = useState("")
  const [title, setTitle] = useState("")
  const [albumId, setAlbumId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<string[]>([])

  // Libère les object URLs de prévisualisation au démontage.
  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    },
    [],
  )

  const addFiles = useCallback((files: File[]) => {
    setError(null)
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
    const skipped = files.length - valid.length
    if (skipped > 0) {
      setError(`${skipped} fichier(s) ignoré(s) — seules les images ≤ 5 Mo sont acceptées.`)
    }
    if (valid.length === 0) return

    const newEntries: FileEntry[] = valid.map((file) => {
      const preview = URL.createObjectURL(file)
      previewUrlsRef.current.push(preview)
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview,
        status: "idle" as const,
      }
    })
    setEntries((prev) => [...prev, ...newEntries])
  }, [])

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const idleCount = entries.filter((e) => e.status === "idle").length
  const doneCount = entries.filter((e) => e.status === "done").length
  const errorCount = entries.filter((e) => e.status === "error").length
  const singleImage = entries.length === 1

  const submitVideo = async () => {
    if (!videoUrl.trim()) {
      setError("L'URL de la vidéo est requise.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onCreate([
        {
          mediaUrl: videoUrl.trim(),
          mediaType: "VIDEO",
          albumId: albumId || undefined,
          title: title.trim() || undefined,
        },
      ])
      onClose()
    } catch {
      setError("Erreur lors de l'enregistrement.")
      setIsSubmitting(false)
    }
  }

  const submitImages = async () => {
    const pending = entries.filter((e) => e.status === "idle")
    if (pending.length === 0) {
      setError("Ajoutez au moins une image.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    setEntries((prev) => prev.map((e) => (e.status === "idle" ? { ...e, status: "uploading" } : e)))

    const uploaded: string[] = []
    let hasErrors = false

    await Promise.allSettled(
      pending.map(async (entry) => {
        try {
          const url = await uploadImage(entry.file)
          setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: "done", url } : e)))
          uploaded.push(url)
        } catch {
          hasErrors = true
          setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: "error" } : e)))
        }
      }),
    )

    if (uploaded.length === 0) {
      setError("Tous les uploads ont échoué. Vérifiez votre connexion et réessayez.")
      setIsSubmitting(false)
      return
    }

    const items: CreateGalleryItemPayload[] = uploaded.map((url) => ({
      mediaUrl: url,
      mediaType: "IMAGE",
      albumId: albumId || undefined,
      // Le titre n'a de sens que pour un import d'une seule image.
      title: uploaded.length === 1 ? title.trim() || undefined : undefined,
    }))

    try {
      await onCreate(items)
      if (!hasErrors) {
        onClose()
        return
      }
      // Succès partiel : on retire les images importées, on garde les échecs visibles.
      setEntries((prev) => prev.filter((e) => e.status === "error"))
      setError("Certaines images ont échoué. Les autres ont bien été ajoutées — réessayez les restantes.")
    } catch {
      setError("Erreur lors de l'enregistrement en base de données.")
    }
    setIsSubmitting(false)
  }

  const handleSubmit = () => {
    if (isSubmitting) return
    if (mediaType === "VIDEO") submitVideo()
    else submitImages()
  }

  const submitDisabled =
    isSubmitting || (mediaType === "IMAGE" ? idleCount === 0 : !videoUrl.trim())

  return (
    <div className="space-y-4 px-6 py-5">
      {/* Sélecteur de type */}
      <div className="inline-flex rounded-lg border border-gray-200 p-1">
        {(["IMAGE", "VIDEO"] as const).map((type) => (
          <button
            key={type}
            type="button"
            disabled={isSubmitting}
            onClick={() => { setMediaType(type); setError(null) }}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              mediaType === type ? "bg-cecj-green text-white" : "text-gray-500 hover:text-gray-800",
            )}
          >
            {type === "IMAGE" ? "Image(s)" : "Vidéo"}
          </button>
        ))}
      </div>

      {mediaType === "IMAGE" ? (
        <>
          {/* Zone de dépôt multi-fichiers (masquée pendant l'upload) */}
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
              <span className="font-medium">Cliquer ou déposer une ou plusieurs images</span>
              <span className="text-xs text-gray-300">JPG, PNG, GIF, WEBP · max 5 Mo par fichier</span>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {/* Progression globale */}
          {isSubmitting && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <div className="mb-2 flex items-center justify-between">
                <span>Import en cours…</span>
                <span>
                  <span className="font-semibold text-cecj-green">{doneCount}</span> / {entries.length}
                  {errorCount > 0 && <span className="ml-2 text-red-500">{errorCount} erreur(s)</span>}
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

          {/* Titre — seulement pour une image unique */}
          {singleImage && (
            <Field label="Titre / légende">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
                placeholder="Description optionnelle…"
              />
            </Field>
          )}
        </>
      ) : (
        <>
          <Field label="URL de la vidéo *">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              placeholder="https://youtube.com/watch?v=…"
            />
          </Field>
          <Field label="Titre / légende">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              placeholder="Description optionnelle…"
            />
          </Field>
        </>
      )}

      {/* Album — appliqué à tous les médias ajoutés */}
      <Field label="Album (optionnel)">
        <select
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          disabled={isSubmitting}
          className={inputCls}
        >
          <option value="">Aucun album</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </Field>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
        >
          {mediaType === "VIDEO"
            ? "Ajouter la vidéo"
            : isSubmitting
              ? "Import en cours…"
              : `Ajouter ${idleCount || ""} ${idleCount > 1 ? "images" : "image"}`.trim()}
        </Button>
      </div>
    </div>
  )
}
