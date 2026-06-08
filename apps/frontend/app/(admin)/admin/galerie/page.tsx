import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = { title: "Galerie" }

export default function AdminGaleriePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Galerie"
        subtitle="Gestion des photos et médias"
        action={<Button>Ajouter un média</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucun média enregistré.</p>
      </Card>
    </div>
  )
}
