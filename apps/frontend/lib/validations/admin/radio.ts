import { z } from "zod"

const optionalHttpsUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https:\/\/[^/\s]+/i.test(value),
    "L’URL doit commencer par https://",
  )

export const radioFormSchema = z.object({
  nameFr: z.string().trim().min(1, "Le nom français est requis").max(120),
  nameEn: z.string().trim().max(120),
  descriptionFr: z.string().trim().max(1000),
  descriptionEn: z.string().trim().max(1000),
  streamUrl: z
    .string()
    .trim()
    .min(1, "L’URL du flux est requise")
    .refine((value) => /^https:\/\/[^/\s]+/i.test(value), "Le flux doit utiliser HTTPS"),
  websiteUrl: optionalHttpsUrl,
  coverImage: optionalHttpsUrl,
  isActive: z.boolean(),
})

export type RadioFormValues = z.infer<typeof radioFormSchema>
