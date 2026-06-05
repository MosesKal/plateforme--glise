import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finances"
        subtitle="Suivi des dons et des dépenses"
        action={<Button>Enregistrer un don</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucune transaction enregistrée.</p>
      </Card>
    </div>
  )
}
