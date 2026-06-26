import { api } from "@/lib/api/client"
import type { SitePage } from "@cecj/shared"

export type { SitePage }

export interface PagePayload {
  slug: string
  titleFr: string
  titleEn?: string
  contentFr: string
  contentEn?: string
  metaDescription?: string
  coverUrl?: string
  published?: boolean
}

export const adminPagesApi = {
  list: () =>
    api.get<SitePage[]>("/pages").then((r) => r.data),

  create: (payload: PagePayload) =>
    api.post<SitePage>("/pages", payload).then((r) => r.data),

  update: (id: string, payload: Partial<PagePayload>) =>
    api.patch<SitePage>(`/pages/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/pages/${id}`).then((r) => r.data),
}
