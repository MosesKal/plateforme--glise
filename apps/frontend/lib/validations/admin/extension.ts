import { z } from "zod"

export const extensionSchema = z.object({
  name:        z.string().min(1, "Le nom est requis"),
  country:     z.string().min(1, "Le pays est requis"),
  city:        z.string().min(1, "La ville est requise"),
  address:     z.string().optional(),
  phone:       z.string().optional(),
  email:       z.union([z.literal(""), z.string().email("Email invalide")]).optional(),
  pastorName:  z.string().optional(),
  pastorPhone: z.string().optional(),
  latitude:    z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ),
  longitude:   z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ),
  status:      z.enum(["ACTIVE", "INACTIVE", "COMING_SOON"]).default("ACTIVE"),
  coverImage:  z.string().optional(),
  description: z.string().optional(),
  foundedAt:   z.string().optional(),
})

export type ExtensionFormValues = z.infer<typeof extensionSchema>
