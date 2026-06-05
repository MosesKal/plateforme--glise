"use client"

import { useCallback, useState } from "react"
import { membresApi } from "@/lib/api/membres"
import type { Membre } from "@/types/models"

export function useMembers() {
  const [membres, setMembres] = useState<Membre[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembres = useCallback(async (page = 1, limit = 20) => {
    setLoading(true)
    setError(null)
    try {
      const res = await membresApi.findAll(page, limit)
      setMembres(res.data)
      setTotal(res.total)
    } catch {
      setError("Impossible de charger les membres.")
    } finally {
      setLoading(false)
    }
  }, [])

  return { membres, total, loading, error, fetchMembres }
}
