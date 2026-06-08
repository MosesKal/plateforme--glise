// @ts-nocheck
import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"

export const metadata: Metadata = { title: "Tableau de bord" }

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la plateforme C.E.C.J."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Utilisateurs" value="—" />
        <StatCard title="Extensions" value="—" />
        <StatCard title="Événements" value="—" />
        <StatCard title="Médias" value="—" />
      </div>
    </div>
  )
}
