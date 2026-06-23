"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchExtensions, toExtension } from "@/lib/api/extensions"
import type { Extension } from "@/constants/extensions"

export function useExtensions() {
  return useQuery({
    queryKey: ["extensions"],
    queryFn: async (): Promise<Extension[]> => {
      const result = await fetchExtensions({ limit: 100 })
      return result.items.map(toExtension)
    },
    staleTime: 5 * 60 * 1000, // cache 5 min côté client
  })
}
