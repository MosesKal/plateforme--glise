import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function EvenementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Événements"
        subtitle="Gestion des événements de l'église"
        action={<Button>Créer un événement</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucun événement planifié.</p>
      </Card>
    </div>
  )
}
