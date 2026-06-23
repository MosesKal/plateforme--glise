import { z } from "zod"

export const createUserSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName:  z.string().min(1, "Le nom est requis"),
  email:     z.string().email("Email invalide"),
  password:  z.string().min(8, "Minimum 8 caractères"),
  roleId:    z.string().min(1, "Le rôle est requis"),
  phone:     z.string().optional(),
  status:    z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName:  z.string().min(1, "Le nom est requis"),
  phone:     z.string().optional(),
  roleId:    z.string().min(1, "Le rôle est requis"),
  status:    z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
