import { cn } from "@/lib/utils"
import type { ExtensionStatus } from "@/lib/api/admin/extensions"

const CONFIG: Record<ExtensionStatus, { label: string; className: string }> = {
  ACTIVE:      { label: "Active",   className: "bg-green-100 text-green-700"  },
  INACTIVE:    { label: "Inactive", className: "bg-gray-100 text-gray-600"    },
  COMING_SOON: { label: "Bientôt",  className: "bg-amber-100 text-amber-700"  },
}

export function ExtensionStatusBadge({ status }: { status: ExtensionStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.INACTIVE
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {label}
    </span>
  )
}
