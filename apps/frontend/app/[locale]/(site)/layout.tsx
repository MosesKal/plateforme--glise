import type { ReactNode } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { GlobalAudioPlayer } from "@/components/features/teachings/player/GlobalAudioPlayer"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      {/* Player global : la lecture continue pendant la navigation sur le site */}
      <GlobalAudioPlayer />
    </div>
  )
}
