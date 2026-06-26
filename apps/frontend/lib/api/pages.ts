import { api } from "@/lib/api/client"
import type { SitePage } from "@cecj/shared"

export const publicPagesApi = {
  getBySlug: (slug: string) =>
    api.get<SitePage>(`/pages/${slug}`).then((r) => r.data),
}
