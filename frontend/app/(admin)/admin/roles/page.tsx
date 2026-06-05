import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = { title: "Rôles" }

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rôles & Permissions"
        subtitle="Contrôle d'accès basé sur les rôles (RBAC)"
        action={<Button>Créer un rôle</Button>}
      />
      <Card>
        <p className="text-sm text-gray-500">Aucun rôle configuré.</p>
      </Card>
    </div>
  )
}
