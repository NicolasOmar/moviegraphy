import * as z from 'zod'

export const UserSchema = z.object({
  email: z.email(),
  id: z.uuid(),
  name: z.string().max(25),
  password: z.string().min(4).max(25)
})

export const UserCreateSchema = z.object({
  email: z.email(),
  name: z.string().max(25),
  password: z.string().min(4).max(25),
  repeatPassword: z.string().min(4).max(25)
})
