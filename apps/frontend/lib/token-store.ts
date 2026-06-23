// Access token: memory only — never persisted (XSS protection)
let _accessToken: string | null = null

export function getAccessToken(): string | null {
  return _accessToken
}

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

// Refresh token: localStorage — survives page reloads
const REFRESH_KEY = "cecj_rt"

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem(REFRESH_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
}
