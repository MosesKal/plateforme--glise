// @ts-nocheck
import { PageHeader } from "@/components/shared/PageHeader"
import { MemberList } from "@/features/membres/components/MemberList"
import { Button } from "@/components/ui/Button"

export default function MembresPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Membres"
        subtitle="Gestion des membres de l'église"
        action={<Button>Ajouter un membre</Button>}
      />
      <MemberList />
    </div>
  )
}
