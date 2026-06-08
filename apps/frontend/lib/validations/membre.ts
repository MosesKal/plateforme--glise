import { z } from "zod"

export const membreSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  dateNaissance: z.string().optional(),
})

export type MembreInput = z.infer<typeof membreSchema>
