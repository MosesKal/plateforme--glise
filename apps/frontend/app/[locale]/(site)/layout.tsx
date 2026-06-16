import type { ReactNode } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
