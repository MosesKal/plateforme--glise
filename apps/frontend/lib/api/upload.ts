import { api } from "@/lib/api/client"

export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimetype: string
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const { data } = await api.post<UploadResponse>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data.url
}
