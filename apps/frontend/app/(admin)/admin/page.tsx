import type { Metadata } from "next"
import { DashboardContent } from "@/components/features/admin/dashboard/DashboardContent"

export const metadata: Metadata = { title: "Tableau de bord" }

export default function AdminDashboardPage() {
  return <DashboardContent />
}
