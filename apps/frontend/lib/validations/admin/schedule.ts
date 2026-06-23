import { z } from "zod"

const DAYS_OPTIONS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const

const timeRegex = /^\d{2}:\d{2}$/

export const scheduleEntrySchema = z.object({
  title:       z.string().min(1, "Le titre est requis"),
  days:        z.array(z.enum(DAYS_OPTIONS)).min(1, "Sélectionnez au moins un jour"),
  startTime:   z.string().regex(timeRegex, "Format HH:mm requis"),
  endTime:     z.string().regex(timeRegex, "Format HH:mm requis"),
  category:    z.string().min(1, "La catégorie est requise"),
  liveOnYoutube:       z.boolean().default(false),
  facebookPhotosAfter: z.boolean().default(false),
  isRecurring: z.boolean().default(true),
  weekStart:   z.string().optional(),
  sortOrder:   z.number().int().default(0),
  isActive:    z.boolean().default(true),
})

export type ScheduleEntryFormValues = z.infer<typeof scheduleEntrySchema>

export const DAYS_OPTIONS_LIST = DAYS_OPTIONS
export const CATEGORIES = ["Prière", "Famille", "Enseignement", "Adoration", "Évangélisation", "Jeûne"] as const
