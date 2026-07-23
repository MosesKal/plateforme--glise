"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { adminTeachingsApi } from "@/lib/api/admin/teachings"
import type {
  AdminAudioTeaching,
  AdminTheme,
  AudioTeachingPayload,
  Speaker,
  UploadProgress,
} from "@/lib/api/admin/teachings"
import { formatDuration, formatFileSize } from "@/components/features/teachings/format"

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-cecj-green focus:ring-2 focus:ring-cecj-green/10"

const ACCEPT = ".mp3,.mpeg,.mpga,.m4a,.aac,.wav,.ogg,.oga,.opus,.flac,audio/*"

const schema = z.object({
  // Requis seulement quand un seul enseignement est créé — en sélection
  // multiple, chaque fichier a son propre titre (validé dans submit()).
  title:       z.string().optional(),
  themeId:     z.string().min(1, "Le thème est requis"),
  speakerId:   z.string().min(1, "L'orateur est requis"),
  description: z.string().optional(),
  preachedAt:  z.string().optional(),
  coverImage:  z.string().optional(),
  tags:        z.string().optional(), // saisie libre, séparée par des virgules
  status:      z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
})

type FormValues = z.infer<typeof schema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/** "la-puissance_de la priere.mp3" → "La puissance de la priere" */
function titleFromFilename(filename: string): string {
  const cleaned = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : filename
}

type QueueItemState = "pending" | "uploading" | "creating" | "done" | "error"

interface QueueItem {
  id: string
  file: File
  title: string
  state: QueueItemState
  progress: UploadProgress | null
  error: string | null
}

const STATE_BADGES: Record<QueueItemState, { label: string; cls: string } | null> = {
  pending:   null,
  uploading: null, // la barre de progression suffit
  creating:  { label: "Traitement…", cls: "bg-blue-50 text-blue-600 animate-pulse" },
  done:      { label: "Créé",        cls: "bg-green-100 text-green-700" },
  error:     { label: "Échec",       cls: "bg-red-100 text-red-700" },
}

interface Props {
  open: boolean
  onClose: () => void
  /** Création ou mise à jour d'un enseignement (mutations du parent). */
  onSubmit: (values: AudioTeachingPayload) => Promise<void>
  initialData?: AdminAudioTeaching | null
  themes: AdminTheme[]
  speakers: Speaker[]
}

export function AudioTeachingFormModal({ open, ...props }: Props) {
  // Le dialogue n'est monté qu'ouvert : chaque ouverture repart d'un état neuf
  // (formulaire, file d'attente) sans reset manuel dans un effet.
  if (!open) return null
  return <TeachingFormDialog {...props} />
}

function TeachingFormDialog({
  onClose,
  onSubmit,
  initialData,
  themes,
  speakers,
}: Omit<Props, "open">) {
  const isEdit = !!initialData

  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: initialData
        ? {
            title:       initialData.title,
            themeId:     initialData.theme.id,
            speakerId:   initialData.speaker.id,
            description: initialData.description ?? "",
            preachedAt:  initialData.preachedAt ? initialData.preachedAt.slice(0, 10) : "",
            coverImage:  initialData.coverImage ?? "",
            tags:        initialData.tags.map((t) => t.name).join(", "),
            status:      initialData.status,
          }
        : {
            status:    "PUBLISHED",
            themeId:   themes[0]?.id ?? "",
            speakerId: speakers[0]?.id ?? "",
          },
    })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<QueueItem[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const updateItem = (id: string, patch: Partial<QueueItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  // Une nouvelle sélection remplace la précédente (comportement natif de
  // l'input file) ; le titre de chaque fichier est pré-rempli depuis son nom.
  const selectFiles = (files: FileList | null) => {
    const list = files ? Array.from(files) : []
    setItems(
      list.map((file) => ({
        id: crypto.randomUUID(),
        file,
        title: titleFromFilename(file.name),
        state: "pending",
        progress: null,
        error: null,
      })),
    )
    setUploadError(null)
  }

  const multi = items.length > 1
  const doneCount = items.filter((i) => i.state === "done").length
  const errorCount = items.filter((i) => i.state === "error").length
  const hasRun = doneCount > 0 || errorCount > 0

  const extractMessage = (err: unknown) => {
    const message =
      (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
    return Array.isArray(message) ? message.join(" · ") : message || null
  }

  /** Upload du fichier puis création/mise à jour — l'unité de travail par fichier. */
  const uploadAndSave = async (item: QueueItem, payload: AudioTeachingPayload) => {
    updateItem(item.id, {
      state: "uploading",
      error: null,
      progress: { percent: 0, loadedBytes: 0, totalBytes: item.file.size },
    })
    let uploaded
    try {
      uploaded = await adminTeachingsApi.uploadAudio(item.file, (progress) =>
        updateItem(item.id, { progress }),
      )
    } catch (err: unknown) {
      updateItem(item.id, {
        state: "error",
        progress: null,
        error:
          extractMessage(err) ||
          "L'upload du fichier a échoué. Vérifiez votre connexion et réessayez.",
      })
      return false
    }
    updateItem(item.id, { state: "creating" })
    try {
      await onSubmit({
        ...payload,
        fileKey:     uploaded.fileKey,
        fileSize:    uploaded.fileSize,
        mimeType:    uploaded.mimeType,
        durationSec: uploaded.durationSec,
      })
      updateItem(item.id, { state: "done", progress: null })
      return true
    } catch (err: unknown) {
      updateItem(item.id, {
        state: "error",
        progress: null,
        error: extractMessage(err) || "Enregistrement impossible. Réessayez.",
      })
      return false
    }
  }

  const submit = async (values: FormValues) => {
    setUploadError(null)

    const common: AudioTeachingPayload = {
      title:       values.title?.trim() ?? "",
      themeId:     values.themeId,
      speakerId:   values.speakerId,
      description: values.description || undefined,
      preachedAt:  values.preachedAt || undefined,
      coverImage:  values.coverImage || undefined,
      status:      values.status,
      tags: values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    }

    // En sélection multiple le titre vient de chaque fichier ; sinon le champ
    // Titre reste obligatoire comme avant.
    if (!multi && !common.title) {
      setError("title", { message: "Le titre est requis" })
      return
    }

    if (isEdit) {
      const item = items[0]
      if (item) {
        if (!(await uploadAndSave(item, common))) return
      } else {
        try {
          await onSubmit(common)
        } catch (err: unknown) {
          setUploadError(extractMessage(err) || "Enregistrement impossible. Réessayez.")
          return
        }
      }
      onClose()
      return
    }

    if (items.length === 0) {
      setUploadError("Sélectionnez au moins un fichier audio.")
      return
    }

    // Traitement séquentiel : un fichier à la fois pour ne saturer ni la
    // connexion ni le serveur (ffprobe). Un échec n'interrompt pas la suite ;
    // un second passage ne rejoue que les fichiers non créés.
    let allOk = true
    for (const item of items.filter((i) => i.state !== "done")) {
      const payload = multi
        ? { ...common, title: item.title.trim() || titleFromFilename(item.file.name) }
        : common
      if (!(await uploadAndSave(item, payload))) allOk = false
    }
    if (allOk) onClose()
  }

  const currentItem = items.find((i) => i.state === "uploading" || i.state === "creating")
  const currentIndex = currentItem ? items.indexOf(currentItem) : -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'enseignement" : "Ajouter un enseignement"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 px-6 py-5">
          {/* Fichier(s) audio */}
          <Field
            label={
              isEdit
                ? "Fichier audio (laisser vide pour conserver l'actuel)"
                : "Fichier(s) audio *"
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={!isEdit}
              accept={ACCEPT}
              disabled={isSubmitting}
              onChange={(e) => selectFiles(e.target.files)}
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-cecj-green/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cecj-green hover:file:bg-cecj-green/20 disabled:opacity-50"
            />
            {!isEdit && (
              <p className="text-xs text-gray-400">
                Vous pouvez sélectionner plusieurs fichiers : un enseignement sera créé par fichier,
                avec un titre pré-rempli depuis son nom.
              </p>
            )}
            {items.length === 1 && (
              <p className="text-xs text-gray-400">
                {items[0].file.name} — {formatFileSize(items[0].file.size)}
              </p>
            )}
            {isEdit && items.length === 0 && initialData?.durationSec ? (
              <p className="text-xs text-gray-400">
                Fichier actuel : {formatDuration(initialData.durationSec)} · {formatFileSize(initialData.fileSize)}
              </p>
            ) : null}

            {/* Progression — fichier unique (création ou remplacement en édition) */}
            {!multi && items[0]?.progress && (
              <div className="mt-2 rounded-xl border border-cecj-green/20 bg-cecj-green/5 p-3.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-cecj-green">
                    {items[0].state === "uploading" ? (
                      <>Envoi du fichier… {items[0].progress.percent}&nbsp;%</>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-cecj-green/30 border-t-cecj-green" />
                        Traitement du fichier (durée, métadonnées)…
                      </span>
                    )}
                  </p>
                  <p className="text-xs tabular-nums text-gray-400">
                    {formatFileSize(items[0].progress.loadedBytes)} / {formatFileSize(items[0].progress.totalBytes)}
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-cecj-green transition-[width] duration-200"
                    style={{ width: `${items[0].progress.percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Ne fermez pas cette fenêtre pendant l&apos;envoi.
                </p>
              </div>
            )}
            {!multi && items[0]?.state === "error" && items[0].error && (
              <p className="text-xs text-red-500">{items[0].error}</p>
            )}
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </Field>

          {/* File d'attente — sélection multiple : un titre éditable par fichier */}
          {multi && (
            <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              {items.map((item, index) => {
                const badge = STATE_BADGES[item.state]
                return (
                  <div key={item.id} className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <input
                          value={item.title}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          disabled={isSubmitting || item.state === "done"}
                          className="w-full rounded-md border border-transparent px-1.5 py-1 text-sm font-medium text-gray-900 outline-none hover:border-gray-200 focus:border-cecj-green disabled:bg-transparent disabled:text-gray-500"
                        />
                        <p className="px-1.5 text-[11px] text-gray-400">
                          {item.file.name} — {formatFileSize(item.file.size)}
                        </p>
                      </div>
                      {badge && (
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                      {item.state === "pending" && !isSubmitting && (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                          aria-label="Retirer ce fichier"
                          className="shrink-0 rounded-lg p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {item.state === "uploading" && item.progress && (
                      <div className="mt-2 px-1.5">
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-semibold text-cecj-green">
                            Envoi… {item.progress.percent}&nbsp;%
                            {currentIndex >= 0 && ` (fichier ${index + 1}/${items.length})`}
                          </p>
                          <p className="text-[11px] tabular-nums text-gray-400">
                            {formatFileSize(item.progress.loadedBytes)} / {formatFileSize(item.progress.totalBytes)}
                          </p>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-cecj-green transition-[width] duration-200"
                            style={{ width: `${item.progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {item.state === "error" && item.error && (
                      <p className="mt-1 px-1.5 text-xs text-red-500">{item.error}</p>
                    )}
                  </div>
                )
              })}

              {isSubmitting && (
                <p className="px-1 text-[11px] text-gray-400">
                  Ne fermez pas cette fenêtre pendant l&apos;envoi.
                </p>
              )}
              {!isSubmitting && hasRun && (
                <p className="px-1 text-xs font-medium text-gray-500">
                  {doneCount} créé{doneCount > 1 ? "s" : ""}
                  {errorCount > 0 && ` · ${errorCount} échec${errorCount > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
          )}

          {/* En sélection multiple, le titre vient du nom de chaque fichier. */}
          {!multi && (
            <Field label="Titre *" error={errors.title?.message}>
              <input {...register("title")} className={inputCls} placeholder="La puissance de la prière" />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Thème *" error={errors.themeId?.message}>
              <select {...register("themeId")} disabled={isSubmitting} className={inputCls}>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.nameFr}</option>
                ))}
              </select>
            </Field>
            <Field label="Orateur *" error={errors.speakerId?.message}>
              <select {...register("speakerId")} disabled={isSubmitting} className={inputCls}>
                {speakers.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
              {speakers.length === 0 && (
                <p className="text-xs text-amber-600">
                  Aucun orateur — créez-en un d&apos;abord via «&nbsp;Thèmes &amp; orateurs&nbsp;».
                </p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de l'enseignement" error={errors.preachedAt?.message}>
              <input {...register("preachedAt")} type="date" disabled={isSubmitting} className={inputCls} />
            </Field>
            <Field label="Statut" error={errors.status?.message}>
              <select {...register("status")} disabled={isSubmitting} className={inputCls}>
                <option value="PUBLISHED">Publié</option>
                <option value="DRAFT">Brouillon</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={3}
              disabled={isSubmitting}
              className={cn(inputCls, "resize-none")}
              placeholder="Résumé de l'enseignement…"
            />
          </Field>

          <Field label="Tags (séparés par des virgules)" error={errors.tags?.message}>
            <input {...register("tags")} disabled={isSubmitting} className={inputCls} placeholder="prière, foi, guérison" />
          </Field>

          <Field label="Image de couverture (facultative)" error={errors.coverImage?.message}>
            <ImageUpload
              value={watch("coverImage") ?? ""}
              onChange={(url) => setValue("coverImage", url, { shouldValidate: true })}
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit
                ? "Enregistrer"
                : errorCount > 0 && !isSubmitting
                  ? `Réessayer les échecs (${errorCount})`
                  : multi
                    ? `Ajouter ${items.length} enseignements`
                    : "Ajouter l'enseignement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
