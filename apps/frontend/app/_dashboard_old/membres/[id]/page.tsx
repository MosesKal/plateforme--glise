import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/Card"

interface Props {
  params: Promise<{ id: string }>
}

export default async function MembreDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <PageHeader title="Fiche membre" />
      <Card>
        <p className="text-sm text-gray-500">ID : {id}</p>
        {/* TODO: afficher les détails du membre */}
      </Card>
    </div>
  )
}
