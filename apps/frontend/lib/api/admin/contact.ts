import { api } from "@/lib/api/client"

export type ContactStatus = "UNREAD" | "READ" | "REPLIED"

export interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  subject?: string | null
  message?: string | null
  status: ContactStatus
  createdAt: string
}

export const adminContactApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ContactMessage[]>("/contact", { params: { limit: 50, ...params } }).then((r) => r.data),

  markRead: (id: string) =>
    api.patch<ContactMessage>(`/contact/${id}/read`).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/contact/${id}`).then((r) => r.data),
}
