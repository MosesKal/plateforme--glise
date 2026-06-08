import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = { title: "Événements" }

export default function AdminEvenementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Événements"
        subtitle="Gestion des événements publiés sur le site"
        action={<Button>Créer un événement</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucun événement enregistré.</p>
      </Card>
    </div>
  )
}
