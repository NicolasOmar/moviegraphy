import type { UsersModel } from '@models'

import * as z from 'zod'

export interface PasswordChangeModel {
  new: string
  old: string
  repeatNew: string
}

// ---------- USERS / INTERFACES ----------
export interface UserFormModel extends Omit<UsersModel, 'id'> {
  repeatPassword: string
}

export type UserLoginModel = Pick<UsersModel, 'password' | 'username'>

export type UserUpdateFormModel = Omit<UsersModel, 'email' | 'id' | 'password'>

export interface UserWithToken extends Pick<UsersModel, 'email'> {
  token: string
}

// ---------- USERS / SCHEMAS ----------
export const UserCreateSchema = z.strictObject({
  email: z.email().max(50),
  name: z.string().max(25).optional(),
  password: z.string().min(4).max(25),
  repeatPassword: z.string().min(4).max(25),
  username: z.string().max(50)
})

export const UserUpdateSchema = z.strictObject({
  ...UserCreateSchema.shape,
  id: z.uuid()
})

export const PasswordChangeSchema = z.strictObject({
  new: z.string(),
  old: z.string(),
  repeatNew: z.string()
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
