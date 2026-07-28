import { api } from "@/lib/api/client"

export type TestimonyStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Testimony {
  id: string
  fullName: string
  content: string
  photoUrl?: string | null
  status: TestimonyStatus
  createdAt: string
  updatedAt: string
}

export interface AdminTestimony {
  id: string
  fullName: string
  phone?: string | null
  originalContent: string
  editedContent?: string | null
  editedAt?: string | null
  photoUrl?: string | null
  status: TestimonyStatus
  createdAt: string
  updatedAt: string
}

export interface TestimoniesResponse {
  items: AdminTestimony[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SubmitTestimonyPayload {
  fullName: string
  phone: string
  content: string
  photoUrl?: string
}

export const adminTestimoniesApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<TestimoniesResponse>("/testimonies", { params: { limit: 100, ...params } }).then((r) => r.data),

  listApproved: () =>
    api.get<Testimony[]>("/testimonies/approved").then((r) => r.data),

  submit: (payload: SubmitTestimonyPayload) =>
    api.post<AdminTestimony>("/testimonies", payload).then((r) => r.data),

  updateStatus: (id: string, status: TestimonyStatus) =>
    api.patch<AdminTestimony>(`/testimonies/${id}/status`, { status }).then((r) => r.data),

  updateContent: (id: string, editedContent: string | null) =>
    api.patch<AdminTestimony>(`/testimonies/${id}/content`, { editedContent }).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/testimonies/${id}`).then((r) => r.data),
}
