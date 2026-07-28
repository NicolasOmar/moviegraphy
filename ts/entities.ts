import type { UserModel } from '@models'

import * as z from 'zod'

// ---------- USERS / INTERFACES ----------
export interface UserFormModel extends Omit<UserModel, 'id'> {
  repeatPassword: string
}

export type UserLoginModel = Pick<UserModel, 'name' | 'password'>

export interface UserWithToken extends Pick<UserModel, 'email'> {
  token: string
}

// ---------- USERS / SCHEMAS ----------
export const UserCreateSchema = z.strictObject({
  email: z.email().max(50),
  name: z.string().max(25),
  password: z.string().min(4).max(25),
  repeatPassword: z.string().min(4).max(25)
})

export const UserUpdateSchema = z.strictObject({
  ...UserCreateSchema.shape,
  id: z.uuid()
})

// ---------- MOVIES / SCHEMAS ----------
export const MovieCreateSchema = z.strictObject({
  countryMade: z.string(),
  description: z.string().max(300).optional(),
  name: z.string().max(150),
  releaseYear: z.coerce.number().min(1850).max(3000)
})

export const MovieUpdateSchema = z.strictObject({
  ...MovieCreateSchema.shape,
  id: z.uuid()
})
