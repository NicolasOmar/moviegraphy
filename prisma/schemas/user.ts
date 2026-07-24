import * as z from 'zod'

// ---------- USERS ----------
export const UserCreateSchema = z.strictObject({
  email: z.email(),
  name: z.string().max(25),
  password: z.string().min(4).max(25),
  repeatPassword: z.string().min(4).max(25)
})

export const UserUpdateSchema = z.strictObject({
  ...UserCreateSchema.shape,
  id: z.uuid()
})

// ---------- MOVIES ----------
export const MovieCreateSchema = z.strictObject({
  countryMade: z.string(),
  description: z.string(),
  name: z.string(),
  releaseYear: z.string()
})

export const MovieUpdateSchema = z.strictObject({
  ...MovieCreateSchema.shape,
  id: z.uuid()
})
