import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = { title: "Extensions" }

export default function AdminExtensionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Extensions"
        subtitle="Gestion des extensions et implantations"
        action={<Button>Ajouter une extension</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucune extension enregistrée.</p>
      </Card>
    </div>
  )
}
