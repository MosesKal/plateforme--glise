import { api } from "@/lib/api/client"

export interface SermonCategory {
  id: string
  name: string
  _count?: { sermons: number }
}

export interface AdminSermon {
  id: string
  title: string
  speaker: string
  description?: string | null
  videoUrl?: string | null
  audioUrl?: string | null
  pdfUrl?: string | null
  coverImage?: string | null
  categoryId?: string | null
  category?: { id: string; name: string } | null
  publishedAt?: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface SermonsResponse {
  items: AdminSermon[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateSermonPayload {
  title: string
  speaker: string
  description?: string
  videoUrl?: string
  audioUrl?: string
  pdfUrl?: string
  coverImage?: string
  categoryId?: string
  publishedAt?: string
  isPublished?: boolean
}

export interface UpdateSermonPayload {
  title?: string
  speaker?: string
  description?: string
  videoUrl?: string
  audioUrl?: string
  pdfUrl?: string
  coverImage?: string
  categoryId?: string | null
  publishedAt?: string | null
  isPublished?: boolean
}

export const adminSermonsApi = {
  list: (params?: { categoryId?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    api.get<SermonsResponse>("/sermons", { params: { limit: 100, ...params } }).then((r) => r.data),

  findOne: (id: string) =>
    api.get<AdminSermon>(`/sermons/${id}`).then((r) => r.data),

  create: (payload: CreateSermonPayload) =>
    api.post<AdminSermon>("/sermons", payload).then((r) => r.data),

  update: (id: string, payload: UpdateSermonPayload) =>
    api.patch<AdminSermon>(`/sermons/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/sermons/${id}`).then((r) => r.data),

  listCategories: () =>
    api.get<SermonCategory[]>("/sermons/categories").then((r) => r.data),

  createCategory: (name: string) =>
    api.post<SermonCategory>("/sermons/categories", { name }).then((r) => r.data),

  updateCategory: (id: string, name: string) =>
    api.patch<SermonCategory>(`/sermons/categories/${id}`, { name }).then((r) => r.data),

  deleteCategory: (id: string) =>
    api.delete(`/sermons/categories/${id}`).then((r) => r.data),
}
