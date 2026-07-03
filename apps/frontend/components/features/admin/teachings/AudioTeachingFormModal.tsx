"use client"

import { useEffect, useRef, useState } from "react"
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

const schema = z.object({
  title:       z.string().min(1, "Le titre est requis"),
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

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: AudioTeachingPayload) => Promise<void>
  initialData?: AdminAudioTeaching | null
  themes: AdminTheme[]
  speakers: Speaker[]
}

export function AudioTeachingFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  themes,
  speakers,
}: Props) {
  const isEdit = !!initialData

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setAudioFile(null)
    setUploadProgress(null)
    setUploadError(null)
    reset(
      initialData
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
    )
  }, [open, initialData, reset, themes, speakers])

  if (!open) return null

  const submit = async (values: FormValues) => {
    setUploadError(null)

    if (!isEdit && !audioFile) {
      setUploadError("Sélectionnez un fichier audio.")
      return
    }

    const payload: AudioTeachingPayload = {
      title:       values.title,
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

    // Upload du fichier d'abord ; la création n'a lieu que s'il aboutit.
    if (audioFile) {
      try {
        setUploadProgress({ percent: 0, loadedBytes: 0, totalBytes: audioFile.size })
        const uploaded = await adminTeachingsApi.uploadAudio(audioFile, setUploadProgress)
        payload.fileKey = uploaded.fileKey
        payload.fileSize = uploaded.fileSize
        payload.mimeType = uploaded.mimeType
        payload.durationSec = uploaded.durationSec
      } catch {
        setUploadProgress(null)
        setUploadError("L'upload du fichier a échoué. Vérifiez votre connexion et réessayez.")
        return
      }
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setUploadProgress(null)
      setUploadError(
        Array.isArray(message) ? message.join(" · ") : message || "Enregistrement impossible. Réessayez.",
      )
    }
  }

  const uploading = uploadProgress !== null && isSubmitting

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Modifier l'enseignement" : "Ajouter un enseignement"}
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 px-6 py-5">
          {/* Fichier audio */}
          <Field label={isEdit ? "Fichier audio (laisser vide pour conserver l'actuel)" : "Fichier audio *"}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.m4a,.aac,.wav,.ogg,.opus,.flac,audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-cecj-green/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cecj-green hover:file:bg-cecj-green/20"
            />
            {audioFile && (
              <p className="text-xs text-gray-400">
                {audioFile.name} — {formatFileSize(audioFile.size)}
              </p>
            )}
            {isEdit && !audioFile && initialData?.durationSec ? (
              <p className="text-xs text-gray-400">
                Fichier actuel : {formatDuration(initialData.durationSec)} · {formatFileSize(initialData.fileSize)}
              </p>
            ) : null}
            {uploadProgress !== null && (
              <div className="mt-2 rounded-xl border border-cecj-green/20 bg-cecj-green/5 p-3.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-cecj-green">
                    {uploadProgress.percent < 100 ? (
                      <>Envoi du fichier… {uploadProgress.percent}&nbsp;%</>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-cecj-green/30 border-t-cecj-green" />
                        Traitement du fichier (durée, métadonnées)…
                      </span>
                    )}
                  </p>
                  <p className="text-xs tabular-nums text-gray-400">
                    {formatFileSize(uploadProgress.loadedBytes)} / {formatFileSize(uploadProgress.totalBytes)}
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-cecj-green transition-[width] duration-200"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Ne fermez pas cette fenêtre pendant l&apos;envoi.
                </p>
              </div>
            )}
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </Field>

          <Field label="Titre *" error={errors.title?.message}>
            <input {...register("title")} className={inputCls} placeholder="La puissance de la prière" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Thème *" error={errors.themeId?.message}>
              <select {...register("themeId")} className={inputCls}>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.nameFr}</option>
                ))}
              </select>
            </Field>
            <Field label="Orateur *" error={errors.speakerId?.message}>
              <select {...register("speakerId")} className={inputCls}>
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
            <Field label="Date de prédication" error={errors.preachedAt?.message}>
              <input {...register("preachedAt")} type="date" className={inputCls} />
            </Field>
            <Field label="Statut" error={errors.status?.message}>
              <select {...register("status")} className={inputCls}>
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
              className={cn(inputCls, "resize-none")}
              placeholder="Résumé de l'enseignement…"
            />
          </Field>

          <Field label="Tags (séparés par des virgules)" error={errors.tags?.message}>
            <input {...register("tags")} className={inputCls} placeholder="prière, foi, guérison" />
          </Field>

          <Field label="Image de couverture (facultative)" error={errors.coverImage?.message}>
            <ImageUpload
              value={watch("coverImage") ?? ""}
              onChange={(url) => setValue("coverImage", url, { shouldValidate: true })}
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting} className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green">
              {isEdit ? "Enregistrer" : "Ajouter l'enseignement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
