import Link from "next/link";
import { ADMIN_ROUTES } from "@/constants/routes";
import type {
  AdminAudioMediaFilter,
  TeachingsStats,
} from "@/lib/api/admin/teachings";

interface HealthItem {
  filter: AdminAudioMediaFilter;
  label: string;
  value: number;
  className: string;
  dotClassName: string;
}

export function AudioMediaHealthPanel({ stats }: { stats: TeachingsStats }) {
  const mediaHealth = stats.mediaHealth ?? {
    ready: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    missing: 0,
  };
  const issueCount = mediaHealth.failed + mediaHealth.missing;
  const items: HealthItem[] = [
    {
      filter: "READY",
      label: "Prêts",
      value: mediaHealth.ready,
      className: "border-emerald-100 bg-emerald-50/60 text-emerald-800",
      dotClassName: "bg-emerald-500",
    },
    {
      filter: "PENDING",
      label: "En attente",
      value: mediaHealth.pending,
      className: "border-blue-100 bg-blue-50/60 text-blue-800",
      dotClassName: "bg-blue-400",
    },
    {
      filter: "PROCESSING",
      label: "En cours",
      value: mediaHealth.processing,
      className: "border-indigo-100 bg-indigo-50/60 text-indigo-800",
      dotClassName: "bg-indigo-500",
    },
    {
      filter: "FAILED",
      label: "Échecs",
      value: mediaHealth.failed,
      className: "border-orange-100 bg-orange-50/70 text-orange-800",
      dotClassName: "bg-orange-500",
    },
    {
      filter: "MISSING",
      label: "Sans fichier",
      value: mediaHealth.missing,
      className: "border-red-100 bg-red-50/70 text-red-800",
      dotClassName: "bg-red-500",
    },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Santé des médias audio
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Identifiez les uploads nécessitant une intervention sans parcourir
            toute la bibliothèque.
          </p>
        </div>
        {issueCount > 0 ? (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
            {issueCount} intervention{issueCount > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            Aucun incident
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.filter}
            href={`${ADMIN_ROUTES.enseignementsAudios}?processing=${item.filter}`}
            className={`group rounded-lg border px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-sm ${item.className}`}
          >
            <span className="flex items-center gap-2 text-xs font-semibold">
              <span className={`h-2 w-2 rounded-full ${item.dotClassName}`} />
              {item.label}
            </span>
            <span className="mt-1 block text-2xl font-bold tabular-nums">
              {item.value}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
