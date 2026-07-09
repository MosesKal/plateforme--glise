import { api } from "./client"

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  role: { id: string; name: string }
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  register: (dto: RegisterDto) =>
    api.post<AuthResponse>("/auth/register", dto),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    api.post<void>("/auth/logout", { refreshToken }),

  // Retourne une nouvelle paire de tokens : le backend révoque toutes les
  // sessions existantes lors du changement de mot de passe.
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<AuthResponse>("/auth/change-password", { currentPassword, newPassword }),
}
