import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function GroupesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Groupes"
        subtitle="Gestion des groupes et cellules"
        action={<Button>Créer un groupe</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucun groupe créé.</p>
      </Card>
    </div>
  )
}
