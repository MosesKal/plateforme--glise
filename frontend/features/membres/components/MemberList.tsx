"use client"

import { useEffect } from "react"
import { useMembers } from "@/features/membres/hooks/useMembers"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export function MemberList() {
  const { membres, loading, error, fetchMembres } = useMembers()

  useEffect(() => {
    fetchMembres()
  }, [fetchMembres])

  if (loading) {
    return <Card><p className="text-sm text-gray-500">Chargement...</p></Card>
  }

  if (error) {
    return <Card><p className="text-sm text-red-500">{error}</p></Card>
  }

  if (membres.length === 0) {
    return <Card><p className="text-sm text-gray-500">Aucun membre enregistré.</p></Card>
  }

  return (
    <Card padding={false}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {membres.map((membre) => (
            <tr key={membre.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {membre.firstName} {membre.lastName}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {membre.email ?? "—"}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <Badge
                  label={membre.status}
                  variant={membre.status === "ACTIF" ? "success" : "default"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
