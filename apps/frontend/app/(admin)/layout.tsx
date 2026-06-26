import type { ReactNode } from "react"
import { Montserrat } from "next/font/google"
import NextTopLoader from "nextjs-toploader"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { Header } from "@/components/layout/Header"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider"
import { AuthInitializer } from "@/components/auth/AuthInitializer"
import "../globals.css"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
})

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full">
        <NextTopLoader color="#ffcb32" height={3} showSpinner={false} />
        <ReactQueryProvider>
          <AuthInitializer />
          <AuthGuard>
            <div className="flex h-screen overflow-hidden bg-gray-100">
              <AdminSidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
          </AuthGuard>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
