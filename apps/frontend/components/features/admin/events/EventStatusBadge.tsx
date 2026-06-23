import { cn } from "@/lib/utils"
import type { EventStatus } from "@/lib/api/admin/events"

const CONFIG: Record<EventStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Publié",   className: "bg-green-100 text-green-700" },
  DRAFT:     { label: "Brouillon", className: "bg-gray-100 text-gray-600"  },
  CANCELLED: { label: "Annulé",   className: "bg-red-100 text-red-600"    },
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.DRAFT
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {label}
    </span>
  )
}
