import { Card } from "@/components/ui/Card"

interface StatCardProps {
  title: string
  value: string | number
  trend?: string
}

export function StatCard({ title, value, trend }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
    </Card>
  )
}
