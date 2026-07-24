"use client"

import { RadioSettingsForm } from "@/components/features/admin/radio/RadioSettingsForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAdminRadio } from "@/hooks/admin/useAdminRadio"

export default function AdminRadioPage() {
  const { data, isLoading, isError } = useAdminRadio()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Radio en direct"
        subtitle="Configurez le flux public diffusé sur le site de la paroisse"
      />

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Impossible de charger la configuration de la radio. Réessayez dans un instant.
        </div>
      ) : (
        <RadioSettingsForm
          key={data?.updatedAt ?? "new-radio"}
          station={data ?? null}
        />
      )}
    </div>
  )
}
