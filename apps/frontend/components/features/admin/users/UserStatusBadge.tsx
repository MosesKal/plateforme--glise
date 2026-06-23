import { cn } from "@/lib/utils"
import type { UserStatus } from "@/lib/api/admin/users"

const config: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE:    { label: "Actif",    cls: "bg-green-100 text-green-700" },
  INACTIVE:  { label: "Inactif", cls: "bg-gray-100 text-gray-500" },
  SUSPENDED: { label: "Suspendu", cls: "bg-red-100 text-red-600" },
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { label, cls } = config[status]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  )
}
