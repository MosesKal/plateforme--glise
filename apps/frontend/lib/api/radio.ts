import type { PublicRadioStation } from "@cecj/shared"
import { api } from "@/lib/api/client"

export const radioApi = {
  getPublic: () =>
    api.get<PublicRadioStation | null>("/radio/public").then((response) => response.data),
}
