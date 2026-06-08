import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = { title: "Utilisateurs" }

export default function UtilisateursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        subtitle="Gestion des comptes administrateurs"
        action={<Button>Ajouter un utilisateur</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucun utilisateur enregistré.</p>
      </Card>
    </div>
  )
}
