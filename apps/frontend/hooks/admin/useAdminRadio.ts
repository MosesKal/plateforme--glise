"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { RadioStationInput } from "@cecj/shared"
import { adminRadioApi } from "@/lib/api/admin/radio"
import { radioQueryKeys } from "@/hooks/useRadio"
import { toast } from "@/store/toast.store"

export function useAdminRadio() {
  return useQuery({
    queryKey: radioQueryKeys.admin,
    queryFn: adminRadioApi.get,
  })
}

export function useSaveRadio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RadioStationInput) => adminRadioApi.save(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: radioQueryKeys.all })
      toast.success("Configuration de la radio enregistrée.")
    },
  })
}

export function useTestRadioStream() {
  return useMutation({
    mutationFn: (streamUrl: string) => adminRadioApi.test(streamUrl),
    onSuccess: () => toast.success("Le flux radio est accessible."),
  })
}
