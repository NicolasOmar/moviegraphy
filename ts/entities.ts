import type { GenresModel, MoviesModel, UsersModel } from '@models'

import * as z from 'zod'

export type LoginFormModel = Pick<UsersModel, 'password' | 'username'>

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

export interface UserUpdateModel
  extends Omit<UsersModel, 'email' | 'id' | 'password'>, TokenModel {}

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
export type CreateGenreForm = GenreFormModel & TokenModel

// ---------- GENRES / INTERFACES ----------
export type GenreFormModel = Omit<GenresModel, 'userId'>
// ---------- GENRES / SCHEMAS ----------
export const GenreCreateSchema = z.strictObject({
  name: z.string().max(300)
})
export type CreateMovieForm = MovieFormModel & TokenModel
// ---------- MOVIES / INTERFACES ----------
export type MovieFormModel = Omit<MoviesModel, 'userId'>
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
