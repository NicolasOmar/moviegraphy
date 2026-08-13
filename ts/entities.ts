import type { UsersModel } from '@models'

import * as z from 'zod'

// ---------- USERS / INTERFACES ----------
export interface PasswordChangeWithToken {
  newPassword: string
  oldPassword: string
  sessionToken: string
}

export interface PasswordUpdateModel {
  new: string
  old: string
  repeatNew: string
}

export interface UserFormModel extends Omit<UsersModel, 'id'> {
  repeatPassword: string
}

export type UserLoginModel = Pick<UsersModel, 'password' | 'username'>

export interface UserUpdateModel
  extends Omit<UsersModel, 'email' | 'id' | 'password'>, TokenModel {}

export interface UserWithToken extends Pick<UsersModel, 'email'>, TokenModel {}

interface TokenModel {
  sessionToken: string
}
// ---------- USERS / SCHEMAS ----------
export const UserBaseSchema = z.strictObject({
  email: z.email().max(50),
  name: z.string().max(25).optional()
})

export const UserCreateSchema = z.strictObject({
  ...UserBaseSchema.shape,
  password: z.string().min(4).max(25),
  repeatPassword: z.string().min(4).max(25),
  username: z.string().max(50)
})

export const UserUpdateSchema = z.strictObject({
  name: z.string().max(25).optional(),
  username: z.string().max(50)
})

export const PasswordChangeSchema = z.strictObject({
  new: z.string(),
  old: z.string(),
  repeatNew: z.string()
})

// ---------- GENRES / INTERFACES ----------
export interface GenreCreateModel {
  name: string
}

export interface GenreWithToken extends GenreCreateModel, TokenModel {}

// ---------- GENRES / SCHEMAS ----------
export const GenreCreateSchema = z.strictObject({
  name: z.string().max(300)
})

// ---------- MOVIES / INTERFACES ----------
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
