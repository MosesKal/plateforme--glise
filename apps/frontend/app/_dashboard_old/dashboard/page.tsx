// @ts-nocheck
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre église"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Membres" value="—" />
        <StatCard title="Événements à venir" value="—" />
        <StatCard title="Groupes" value="—" />
        <StatCard title="Dons ce mois" value="—" />
      </div>
    </div>
  )
}
