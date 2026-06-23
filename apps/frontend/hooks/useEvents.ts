"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchEvents } from "@/lib/api/events"
import { CHURCH_EVENTS, type ChurchEvent } from "@/constants/events"

export function useEvents(): { data: ChurchEvent[]; isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  })

  return {
    data:      data ?? CHURCH_EVENTS,
    isLoading,
    isError,
  }
}
