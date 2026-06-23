import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
})

// Unwrap the { success, data } envelope returned by the backend
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "data" in response.data) {
      response.data = response.data.data
    }
    return response
  },
  (error) => Promise.reject(error),
)
