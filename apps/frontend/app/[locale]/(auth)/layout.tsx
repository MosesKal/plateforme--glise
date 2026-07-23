import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cecj-tint px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
