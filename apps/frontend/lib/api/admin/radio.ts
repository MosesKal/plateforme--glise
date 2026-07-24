import type {
  AdminRadioStation,
  RadioStationInput,
  RadioStreamTestResult,
} from "@cecj/shared"
import { api } from "@/lib/api/client"

export const adminRadioApi = {
  get: () =>
    api.get<AdminRadioStation | null>("/radio/admin").then((response) => response.data),

  save: (payload: RadioStationInput) =>
    api.put<AdminRadioStation>("/radio/admin", payload).then((response) => response.data),

  test: (streamUrl: string) =>
    api
      .post<RadioStreamTestResult>("/radio/admin/test", { streamUrl })
      .then((response) => response.data),
}
