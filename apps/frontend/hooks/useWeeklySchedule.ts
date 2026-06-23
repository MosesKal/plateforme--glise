"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchSchedule, toWeeklyProgram, FALLBACK_PROGRAM } from "@/lib/api/schedule"

export function useWeeklySchedule(week?: string) {
  return useQuery({
    queryKey: ["schedule", week ?? "current"],
    queryFn: async () => {
      const result = await fetchSchedule(week)
      return {
        source: result.source,
        program: toWeeklyProgram(result.entries),
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: {
      source: "recurring" as const,
      program: FALLBACK_PROGRAM,
    },
  })
}
