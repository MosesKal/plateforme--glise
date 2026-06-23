import { api } from "./client"
import type { Extension, Continent } from "@/constants/extensions"

// ── API shape (what the backend returns) ────────────────────────────────────

export interface ApiExtension {
  id: string
  name: string
  country: string
  city: string
  address: string | null
  phone: string | null
  email: string | null
  pastorName: string | null
  pastorPhone: string | null
  latitude: number | null
  longitude: number | null
  status: "ACTIVE" | "INACTIVE" | "COMING_SOON"
  coverImage: string | null
  description: string | null
  foundedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiPaginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Country → display metadata lookup ───────────────────────────────────────

const COUNTRY_META: Record<string, { code: string; continent: Continent }> = {
  "République Démocratique du Congo": { code: "CD", continent: "rdc" },
  "Uganda":                           { code: "UG", continent: "afrique" },
  "Zambie":                           { code: "ZM", continent: "afrique" },
  "Zimbabwe":                         { code: "ZW", continent: "afrique" },
  "Tanzanie":                         { code: "TZ", continent: "afrique" },
  "Burundi":                          { code: "BI", continent: "afrique" },
  "Rwanda":                           { code: "RW", continent: "afrique" },
  "Angola":                           { code: "AO", continent: "afrique" },
  "Congo-Brazzaville":                { code: "CG", continent: "afrique" },
}

function getMeta(country: string): { code: string; continent: Continent } {
  return COUNTRY_META[country] ?? { code: "CD", continent: "rdc" }
}

// ── Adapter: ApiExtension → frontend Extension type ─────────────────────────

export function toExtension(api: ApiExtension): Extension {
  const { code, continent } = getMeta(api.country)
  return {
    id:          api.id,
    name:        api.name,
    type:        "fille",
    status:      api.status === "ACTIVE" ? "active" : "establishing",
    continent,
    country:     api.country,
    countryCode: code,
    city:        api.city,
    address:     api.address ?? undefined,
    phone:       api.phone ?? undefined,
    pastor:      api.pastorName ?? undefined,
    founded:     api.foundedAt ? String(new Date(api.foundedAt).getFullYear()) : undefined,
    lat:         api.latitude  ?? 0,
    lng:         api.longitude ?? 0,
  }
}

// ── API calls ────────────────────────────────────────────────────────────────

export async function fetchExtensions(params?: {
  country?: string
  page?: number
  limit?: number
}): Promise<ApiPaginated<ApiExtension>> {
  const { data } = await api.get<ApiPaginated<ApiExtension>>("/extensions", {
    params: { limit: 100, ...params },
  })
  return data
}
