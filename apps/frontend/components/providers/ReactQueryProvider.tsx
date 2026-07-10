"use client"

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { parseApiError } from "@/lib/api/errors"
import { toast } from "@/store/toast.store"
import { Toaster } from "@/components/ui/Toaster"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // NB : chaque `await mutateAsync(...)` doit être entouré d'un try/catch à son
  // point d'appel — une rejection non gérée déclenche l'overlay d'erreur Next.js
  // en dev (son listener `unhandledrejection` ignore preventDefault), alors que
  // l'affichage est déjà assuré par le toast global ci-dessous.
  const [client] = useState(
    () =>
      new QueryClient({
        // Toute mutation en échec (création, édition, suppression…) affiche
        // l'erreur backend traduite en toast — un seul endroit pour tous les
        // modules. Un composant qui gère lui-même l'erreur pose
        // meta: { silentError: true } sur sa mutation.
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.silentError) return
            toast.error(parseApiError(error).message)
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
