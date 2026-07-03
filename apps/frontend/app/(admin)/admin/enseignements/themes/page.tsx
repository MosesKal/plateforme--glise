"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { ADMIN_ROUTES } from "@/constants/routes"
import { ThemeFormModal } from "@/components/features/admin/teachings/ThemeFormModal"
import { SpeakerFormModal } from "@/components/features/admin/teachings/SpeakerFormModal"
import {
  useAdminSpeakers,
  useAdminThemes,
  useCreateSpeaker,
  useCreateTheme,
  useDeleteSpeaker,
  useDeleteTheme,
  useUpdateSpeaker,
  useUpdateTheme,
} from "@/hooks/admin/useAdminTeachings"
import type {
  AdminTheme,
  Speaker,
  SpeakerPayload,
  ThemePayload,
} from "@/lib/api/admin/teachings"

type Tab = "themes" | "speakers"

function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
      <span className="text-xs text-red-700">Supprimer ?</span>
      <button
        onClick={onConfirm}
        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
      >
        Oui
      </button>
      <button
        onClick={onCancel}
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600"
      >
        Non
      </button>
    </div>
  )
}

export default function AdminTeachingThemesPage() {
  const [tab, setTab] = useState<Tab>("themes")

  const { data: themes = [], isLoading: themesLoading } = useAdminThemes()
  const { data: speakers = [], isLoading: speakersLoading } = useAdminSpeakers()

  const createTheme = useCreateTheme()
  const updateTheme = useUpdateTheme()
  const deleteTheme = useDeleteTheme()
  const createSpeaker = useCreateSpeaker()
  const updateSpeaker = useUpdateSpeaker()
  const deleteSpeaker = useDeleteSpeaker()

  const [themeModalOpen, setThemeModalOpen] = useState(false)
  const [themeTarget, setThemeTarget] = useState<AdminTheme | null>(null)
  const [speakerModalOpen, setSpeakerModalOpen] = useState(false)
  const [speakerTarget, setSpeakerTarget] = useState<Speaker | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const submitTheme = async (payload: ThemePayload) => {
    if (themeTarget) {
      await updateTheme.mutateAsync({ id: themeTarget.id, payload })
    } else {
      await createTheme.mutateAsync(payload)
    }
    setThemeModalOpen(false)
    setThemeTarget(null)
  }

  const submitSpeaker = async (payload: SpeakerPayload) => {
    if (speakerTarget) {
      await updateSpeaker.mutateAsync({ id: speakerTarget.id, payload })
    } else {
      await createSpeaker.mutateAsync(payload)
    }
    setSpeakerModalOpen(false)
    setSpeakerTarget(null)
  }

  const handleDelete = async (kind: Tab, id: string) => {
    setDeleteError(null)
    try {
      if (kind === "themes") {
        await deleteTheme.mutateAsync(id)
      } else {
        await deleteSpeaker.mutateAsync(id)
      }
    } catch (err: unknown) {
      // 409 = contient encore des enseignements (FK RESTRICT côté backend)
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Suppression impossible."
      setDeleteError(message)
    }
    setDeleteId(null)
  }

  return (
    <>
      <ThemeFormModal
        open={themeModalOpen}
        onClose={() => { setThemeModalOpen(false); setThemeTarget(null) }}
        onSubmit={submitTheme}
        initialData={themeTarget}
      />
      <SpeakerFormModal
        open={speakerModalOpen}
        onClose={() => { setSpeakerModalOpen(false); setSpeakerTarget(null) }}
        onSubmit={submitSpeaker}
        initialData={speakerTarget}
      />

      <div className="space-y-6">
        <PageHeader
          title="Thèmes & orateurs"
          subtitle="Organisation de la bibliothèque d'enseignements"
          action={
            <div className="flex gap-2">
              <Link
                href={ADMIN_ROUTES.enseignements}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
              >
                ← Enseignements
              </Link>
              {tab === "themes" ? (
                <Button
                  onClick={() => { setThemeTarget(null); setThemeModalOpen(true) }}
                  className="bg-cecj-green hover:bg-cecj-green/90"
                >
                  + Créer un thème
                </Button>
              ) : (
                <Button
                  onClick={() => { setSpeakerTarget(null); setSpeakerModalOpen(true) }}
                  className="bg-cecj-green hover:bg-cecj-green/90"
                >
                  + Ajouter un orateur
                </Button>
              )}
            </div>
          }
        />

        {/* Onglets */}
        <div className="flex gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3">
          {([
            { value: "themes",   label: `Thèmes (${themes.length})`     },
            { value: "speakers", label: `Orateurs (${speakers.length})` },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setTab(value); setDeleteId(null); setDeleteError(null) }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === value
                  ? "bg-cecj-green text-white"
                  : "border border-gray-200 text-gray-600 hover:border-cecj-green hover:text-cecj-green"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {deleteError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {deleteError}
          </div>
        )}

        {/* Thèmes */}
        {tab === "themes" &&
          (themesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : themes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <p className="text-sm text-gray-400">Aucun thème. Créez le premier.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className={`mb-3 h-1 w-12 rounded ${theme.isActive ? "bg-cecj-green" : "bg-gray-200"}`} />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900">{theme.nameFr}</h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {theme._count.audioTeachings} enseignement{theme._count.audioTeachings > 1 ? "s" : ""}
                      </p>
                    </div>
                    {!theme.isActive && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        Inactif
                      </span>
                    )}
                  </div>

                  {theme.descriptionFr && (
                    <p className="mt-2 text-xs text-gray-400 line-clamp-2">{theme.descriptionFr}</p>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    {deleteId === theme.id ? (
                      <DeleteConfirm
                        onConfirm={() => handleDelete("themes", theme.id)}
                        onCancel={() => setDeleteId(null)}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => { setThemeTarget(theme); setThemeModalOpen(true) }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => { setDeleteId(theme.id); setDeleteError(null) }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Orateurs */}
        {tab === "speakers" &&
          (speakersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : speakers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <p className="text-sm text-gray-400">Aucun orateur. Ajoutez le premier.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4"
                >
                  {speaker.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photoUrl}
                      alt={speaker.fullName}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cecj-green/10 text-sm font-bold text-cecj-green">
                      {speaker.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{speaker.fullName}</span>
                      {speaker.title && <span className="text-xs text-gray-400">{speaker.title}</span>}
                      {!speaker.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {speaker._count?.audioTeachings ?? 0} enseignement
                      {(speaker._count?.audioTeachings ?? 0) > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {deleteId === speaker.id ? (
                      <DeleteConfirm
                        onConfirm={() => handleDelete("speakers", speaker.id)}
                        onCancel={() => setDeleteId(null)}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => { setSpeakerTarget(speaker); setSpeakerModalOpen(true) }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => { setDeleteId(speaker.id); setDeleteError(null) }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </>
  )
}
