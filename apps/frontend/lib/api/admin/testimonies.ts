import { api } from "@/lib/api/client"

export type TestimonyStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Testimony {
  id: string
  fullName: string
  phone?: string | null
  content: string
  photoUrl?: string | null
  status: TestimonyStatus
  createdAt: string
  updatedAt: string
}

export interface TestimoniesResponse {
  items: Testimony[]
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
    api.post<Testimony>("/testimonies", payload).then((r) => r.data),

  updateStatus: (id: string, status: TestimonyStatus) =>
    api.patch<Testimony>(`/testimonies/${id}/status`, { status }).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/testimonies/${id}`).then((r) => r.data),
}
