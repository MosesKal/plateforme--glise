"use client"

import { useQuery } from "@tanstack/react-query"
import { radioApi } from "@/lib/api/radio"

export const radioQueryKeys = {
  all: ["radio"] as const,
  public: ["radio", "public"] as const,
  admin: ["radio", "admin"] as const,
}

export function usePublicRadio() {
  return useQuery({
    queryKey: radioQueryKeys.public,
    queryFn: radioApi.getPublic,
    staleTime: 5 * 60 * 1000,
  })
}
