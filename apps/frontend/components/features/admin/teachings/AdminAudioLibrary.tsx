"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AudioTeachingFormModal } from "@/components/features/admin/teachings/AudioTeachingFormModal";
import {
  formatDuration,
  formatFileSize,
} from "@/components/features/teachings/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/Button";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useAdminAudioTeachings,
  useAdminSpeakers,
  useAdminThemes,
  useCreateAudioTeaching,
  useDeleteAudioTeaching,
  useReorderAudioTeachings,
  useRetryAudioProcessing,
  useTeachingsStats,
  useUpdateAudioTeaching,
} from "@/hooks/admin/useAdminTeachings";
import type {
  AdminAudioMediaFilter,
  AdminAudioTeaching,
  AudioProcessingStatus,
  AudioTeachingPayload,
  TeachingStatus,
} from "@/lib/api/admin/teachings";

type AdminSort = "recent" | "oldest" | "title" | "popular" | "manual";

const STATUS_LABELS: Record<TeachingStatus, { label: string; cls: string }> = {
  PUBLISHED: {
    label: "Publié",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },
  DRAFT: {
    label: "Brouillon",
    cls: "bg-amber-50 text-amber-700 ring-amber-600/10",
  },
  ARCHIVED: {
    label: "Archivé",
    cls: "bg-gray-100 text-gray-600 ring-gray-500/10",
  },
};

const PROCESSING_LABELS: Record<
  AudioProcessingStatus,
  { label: string; shortLabel: string; cls: string } | null
> = {
  READY: null,
  PENDING: {
    label: "Optimisation en attente",
    shortLabel: "En attente",
    cls: "bg-blue-50 text-blue-700 ring-blue-600/10",
  },
  PROCESSING: {
    label: "Optimisation en cours",
    shortLabel: "En cours",
    cls: "bg-blue-50 text-blue-700 ring-blue-600/10",
  },
  FAILED: {
    label: "Optimisation échouée",
    shortLabel: "Échec",
    cls: "bg-orange-50 text-orange-700 ring-orange-600/10",
  },
};

const PAGE_SIZES = [25, 50, 100] as const;

function formatTotalDuration(totalSec: number): string {
  if (!totalSec) return "0 min";
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.round((totalSec % 3600) / 60);
  return hours > 0
    ? `${hours} h ${String(minutes).padStart(2, "0")} min`
    : `${minutes} min`;
}

function formatAdminDate(value: string | null | undefined): string {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: TeachingStatus }) {
  const info = STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ring-1 ring-inset ${info.cls}`}
    >
      {info.label}
    </span>
  );
}

function ProcessingBadge({ teaching }: { teaching: AdminAudioTeaching }) {
  if (!teaching.fileKey) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
        Sans audio
      </span>
    );
  }
  const info = PROCESSING_LABELS[teaching.processing];
  if (!info)
    return <span className="text-xs font-medium text-emerald-700">Prêt</span>;
  return (
    <span
      title={info.label}
      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ring-1 ring-inset ${info.cls}`}
    >
      {info.shortLabel}
    </span>
  );
}

function ActionIcon({
  label,
  onClick,
  children,
  tone = "default",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger" | "warning";
  disabled?: boolean;
}) {
  const tones = {
    default: "text-gray-500 hover:bg-cecj-green/10 hover:text-cecj-green",
    danger: "text-gray-400 hover:bg-red-50 hover:text-red-600",
    warning: "text-orange-500 hover:bg-orange-50 hover:text-orange-700",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:pointer-events-none disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 7.125L16.875 4.5M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0115.916 21H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992V4.356m-.39 11.39a8.25 8.25 0 11-2.224-8.117l2.614 1.719"
      />
    </svg>
  );
}

export function AdminAudioLibrary({
  initialProcessing = "",
}: {
  initialProcessing?: AdminAudioMediaFilter | "";
}) {
  const [themeId, setThemeId] = useState("");
  const [speakerId, setSpeakerId] = useState("");
  const [status, setStatus] = useState<TeachingStatus | "">("");
  const [processing, setProcessing] = useState<AdminAudioMediaFilter | "">(
    initialProcessing,
  );
  const [sort, setSort] = useState<AdminSort>("recent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(25);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data: themes = [] } = useAdminThemes();
  const { data: speakers = [] } = useAdminSpeakers();
  const { data: stats } = useTeachingsStats();
  const { data, isLoading, isError, isFetching } = useAdminAudioTeachings({
    themeId: themeId || undefined,
    speakerId: speakerId || undefined,
    status: status || undefined,
    processing: processing || undefined,
    search: debouncedSearch || undefined,
    sort,
    page,
    limit: pageSize,
  });

  const create = useCreateAudioTeaching();
  const update = useUpdateAudioTeaching();
  const remove = useDeleteAudioTeaching();
  const reorder = useReorderAudioTeachings();
  const retryProcessing = useRetryAudioProcessing();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminAudioTeaching | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAudioTeaching | null>(
    null,
  );
  const items = useMemo(() => data?.items ?? [], [data]);

  if (data && page > 1 && page > data.totalPages) {
    setPage(Math.max(data.totalPages, 1));
  }

  const canReorder =
    Boolean(themeId) &&
    sort === "manual" &&
    !debouncedSearch &&
    !speakerId &&
    !status &&
    !processing;
  const activeFilterCount = [
    themeId,
    speakerId,
    status,
    processing,
    debouncedSearch,
  ].filter(Boolean).length;

  const changeFilter = (callback: () => void) => {
    setPage(1);
    callback();
  };

  const resetFilters = () => {
    setThemeId("");
    setSpeakerId("");
    setStatus("");
    setProcessing("");
    setSearch("");
    setSort("recent");
    setPage(1);
  };

  const handleSubmit = async (payload: AudioTeachingPayload) => {
    if (editTarget) await update.mutateAsync({ id: editTarget.id, payload });
    else await create.mutateAsync(payload);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    reorder.mutate([
      { id: items[index].id, position: items[target].position },
      { id: items[target].id, position: items[index].position },
    ]);
  };

  const openEdit = (teaching: AdminAudioTeaching) => {
    setEditTarget(teaching);
    setModalOpen(true);
  };

  const statusCards: Array<{
    value: TeachingStatus | "";
    label: string;
    count: number | string;
    activeClass: string;
  }> = [
    {
      value: "",
      label: "Tous",
      count: stats?.total ?? "…",
      activeClass: "border-cecj-green bg-cecj-green text-white",
    },
    {
      value: "PUBLISHED",
      label: "Publiés",
      count: stats?.published ?? "…",
      activeClass: "border-emerald-600 bg-emerald-600 text-white",
    },
    {
      value: "DRAFT",
      label: "Brouillons",
      count: stats?.draft ?? "…",
      activeClass: "border-amber-500 bg-amber-500 text-white",
    },
    {
      value: "ARCHIVED",
      label: "Archivés",
      count: stats?.archived ?? "…",
      activeClass: "border-gray-600 bg-gray-600 text-white",
    },
  ];

  return (
    <>
      <AudioTeachingFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        initialData={editTarget}
        themes={themes}
        speakers={speakers}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TrashIcon />
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Supprimer cet enseignement ?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              « {deleteTarget.title} » et son fichier audio seront supprimés.
              Cette action ne peut pas être annulée depuis le dashboard.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  })
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {remove.isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <PageHeader
          title="Bibliothèque audio"
          subtitle="Recherchez, filtrez et gérez les enseignements sans parcourir de longues listes."
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={ADMIN_ROUTES.enseignementsThemes}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
              >
                Thèmes & orateurs
              </Link>
              <Button
                onClick={() => {
                  setEditTarget(null);
                  setModalOpen(true);
                }}
                className="bg-cecj-green hover:bg-cecj-green/90"
              >
                + Importer un audio
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statusCards.map((card) => {
            const active = status === card.value;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => changeFilter(() => setStatus(card.value))}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? card.activeClass
                    : "border-gray-200 bg-white text-gray-700 hover:border-cecj-green/40"
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${active ? "text-white/70" : "text-gray-400"}`}
                >
                  {card.label}
                </span>
                <span className="mt-1 block text-2xl font-bold">
                  {card.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-500">
          <span>
            <strong className="text-gray-900">
              {stats ? formatTotalDuration(stats.totalDurationSec) : "…"}
            </strong>{" "}
            de contenu
          </span>
          <span>
            <strong className="text-gray-900">
              {stats?.totalPlays ?? "…"}
            </strong>{" "}
            écoutes
          </span>
          <span>
            <strong className="text-gray-900">
              {stats ? formatFileSize(stats.storageUsedBytes) : "…"}
            </strong>{" "}
            utilisés
          </span>
          <span className="ml-auto hidden text-gray-400 sm:inline">
            Les cartes ci-dessus filtrent directement la liste.
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(event) =>
                changeFilter(() => setSearch(event.target.value))
              }
              placeholder="Rechercher par titre, thème, description ou orateur…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-cecj-green focus:bg-white focus:ring-2 focus:ring-cecj-green/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => changeFilter(() => setSearch(""))}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.25fr_1.25fr_1fr_1fr_auto_auto]">
            <select
              value={themeId}
              onChange={(event) => {
                const nextThemeId = event.target.value;
                changeFilter(() => {
                  setThemeId(nextThemeId);
                  if (!nextThemeId && sort === "manual") setSort("recent");
                });
              }}
              className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-cecj-green"
            >
              <option value="">Tous les thèmes</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.nameFr} ({theme._count.audioTeachings})
                </option>
              ))}
            </select>

            <select
              value={speakerId}
              onChange={(event) =>
                changeFilter(() => setSpeakerId(event.target.value))
              }
              className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-cecj-green"
            >
              <option value="">Tous les orateurs</option>
              {speakers.map((speaker) => (
                <option key={speaker.id} value={speaker.id}>
                  {speaker.fullName}
                </option>
              ))}
            </select>

            <select
              value={processing}
              onChange={(event) =>
                changeFilter(() =>
                  setProcessing(
                    event.target.value as AdminAudioMediaFilter | "",
                  ),
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-cecj-green"
            >
              <option value="">Tous les médias</option>
              <option value="MISSING">Sans fichier audio</option>
              <option value="READY">Audio prêt</option>
              <option value="PENDING">En attente</option>
              <option value="PROCESSING">En cours</option>
              <option value="FAILED">Optimisation échouée</option>
            </select>

            <select
              value={sort}
              onChange={(event) =>
                changeFilter(() => setSort(event.target.value as AdminSort))
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-cecj-green"
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="title">Titre A–Z</option>
              <option value="popular">Plus écoutés</option>
              {themeId && <option value="manual">Ordre éditorial</option>}
            </select>

            <select
              value={pageSize}
              onChange={(event) =>
                changeFilter(() =>
                  setPageSize(
                    Number(event.target.value) as (typeof PAGE_SIZES)[number],
                  ),
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-cecj-green"
              aria-label="Nombre de lignes par page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              disabled={activeFilterCount === 0 && sort === "recent"}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-cecj-green transition hover:bg-cecj-green/5 disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              Réinitialiser
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {data
                ? `${data.total} enseignement${data.total > 1 ? "s" : ""}`
                : "Chargement de la bibliothèque"}
            </h2>
            {canReorder && (
              <p className="mt-0.5 text-xs text-gray-400">
                Utilisez les flèches pour ajuster l’ordre éditorial dans ce
                thème.
              </p>
            )}
          </div>
          {isFetching && !isLoading && (
            <span className="text-xs font-medium text-cecj-green">
              Actualisation…
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[74px] animate-pulse border-b border-gray-100 bg-gray-50/70 last:border-0"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            La bibliothèque n’a pas pu être chargée. Vérifiez le backend et
            votre session.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-sm text-gray-500">
              {activeFilterCount > 0
                ? "Aucun enseignement ne correspond à ces filtres."
                : "Aucun enseignement n’a encore été ajouté."}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm font-bold text-cecj-green hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    {canReorder && <th className="w-10 px-2 py-3" />}
                    <th className="w-[34%] px-4 py-3">Enseignement</th>
                    <th className="w-[22%] px-4 py-3">Classement</th>
                    <th className="w-[13%] px-4 py-3">Publication</th>
                    <th className="w-[15%] px-4 py-3">Média</th>
                    <th className="w-[8%] px-4 py-3 text-right">Écoutes</th>
                    <th className="w-28 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((teaching, index) => (
                    <tr
                      key={teaching.id}
                      className="group transition hover:bg-cecj-green/[0.025]"
                    >
                      {canReorder && (
                        <td className="px-2 py-3">
                          <div className="flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0 || reorder.isPending}
                              aria-label="Monter"
                              className="text-gray-300 hover:text-cecj-green disabled:opacity-20"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(index, 1)}
                              disabled={
                                index === items.length - 1 || reorder.isPending
                              }
                              aria-label="Descendre"
                              className="text-gray-300 hover:text-cecj-green disabled:opacity-20"
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEdit(teaching)}
                          className="block max-w-full truncate text-left text-sm font-semibold text-gray-900 hover:text-cecj-green hover:underline"
                        >
                          {teaching.title}
                        </button>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {formatAdminDate(
                            teaching.preachedAt ?? teaching.createdAt,
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {teaching.theme.nameFr}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {teaching.speaker.fullName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={teaching.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ProcessingBadge teaching={teaching} />
                        <p className="mt-1 truncate text-[11px] text-gray-400">
                          {formatDuration(teaching.durationSec)} ·{" "}
                          {formatFileSize(teaching.fileSize)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gray-600">
                        {teaching.playCount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-0.5">
                          {teaching.processing === "FAILED" && (
                            <ActionIcon
                              label="Relancer l’optimisation"
                              tone="warning"
                              disabled={retryProcessing.isPending}
                              onClick={() =>
                                retryProcessing.mutate(teaching.id)
                              }
                            >
                              <RetryIcon />
                            </ActionIcon>
                          )}
                          <ActionIcon
                            label="Modifier"
                            onClick={() => openEdit(teaching)}
                          >
                            <EditIcon />
                          </ActionIcon>
                          <ActionIcon
                            label="Supprimer"
                            tone="danger"
                            onClick={() => setDeleteTarget(teaching)}
                          >
                            <TrashIcon />
                          </ActionIcon>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {items.map((teaching) => (
                <article
                  key={teaching.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => openEdit(teaching)}
                        className="line-clamp-2 text-left text-sm font-bold text-gray-900 hover:text-cecj-green"
                      >
                        {teaching.title}
                      </button>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {teaching.theme.nameFr} · {teaching.speaker.fullName}
                      </p>
                    </div>
                    <StatusBadge status={teaching.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                    <ProcessingBadge teaching={teaching} />
                    <span className="text-xs text-gray-400">
                      {formatDuration(teaching.durationSec)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {teaching.playCount} écoute
                      {teaching.playCount > 1 ? "s" : ""}
                    </span>
                    <div className="ml-auto flex gap-1">
                      {teaching.processing === "FAILED" && (
                        <ActionIcon
                          label="Relancer l’optimisation"
                          tone="warning"
                          onClick={() => retryProcessing.mutate(teaching.id)}
                        >
                          <RetryIcon />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        label="Modifier"
                        onClick={() => openEdit(teaching)}
                      >
                        <EditIcon />
                      </ActionIcon>
                      <ActionIcon
                        label="Supprimer"
                        tone="danger"
                        onClick={() => setDeleteTarget(teaching)}
                      >
                        <TrashIcon />
                      </ActionIcon>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            itemLabel="enseignement"
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
