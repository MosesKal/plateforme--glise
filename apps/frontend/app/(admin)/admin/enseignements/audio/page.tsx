import { AdminAudioLibrary } from "@/components/features/admin/teachings/AdminAudioLibrary";
import type { AdminAudioMediaFilter } from "@/lib/api/admin/teachings";

const MEDIA_FILTERS = new Set<AdminAudioMediaFilter>([
  "MISSING",
  "READY",
  "PENDING",
  "PROCESSING",
  "FAILED",
]);

export default async function AdminEnseignementsAudioPage({
  searchParams,
}: {
  searchParams: Promise<{ processing?: string }>;
}) {
  const processing = (await searchParams).processing;
  const initialProcessing = MEDIA_FILTERS.has(
    processing as AdminAudioMediaFilter,
  )
    ? (processing as AdminAudioMediaFilter)
    : "";

  return <AdminAudioLibrary initialProcessing={initialProcessing} />;
}
