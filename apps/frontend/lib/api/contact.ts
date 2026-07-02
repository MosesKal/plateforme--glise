import { api } from "@/lib/api/client"

export interface ContactPayload {
  firstName: string
  lastName: string
  phone: string
  subject?: string
  message?: string
}

export const contactApi = {
  send: (payload: ContactPayload) =>
    api.post("/contact", payload).then((r) => r.data),
}
