import type { User } from "./models"

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface AuthResponse {
  user: User
  accessToken: string
}
