import { z } from "zod"

export const eventSchema = z.object({
  titleFr:      z.string().min(1, "Le titre est requis"),
  titleEn:      z.string().optional(),
  descriptionFr: z.string().optional(),
  category:     z.string().optional(),
  speaker:      z.string().optional(),
  organizer:    z.string().optional(),
  startDate:    z.string().min(1, "La date de début est requise"),
  endDate:      z.string().optional(),
  location:     z.string().optional(),
  address:      z.string().optional(),
  coverImage:   z.string().optional(),
  status:       z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).default("DRAFT"),
  isFeatured:   z.boolean().default(false),
})

export type EventFormValues = z.infer<typeof eventSchema>
