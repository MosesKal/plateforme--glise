import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = { title: "Gestion des pages" }

export default function AdminPagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        subtitle="Gestion du contenu éditorial du site public"
      />
      <Card>
        <p className="text-sm text-gray-500">Aucune page configurée.</p>
      </Card>
    </div>
  )
}
