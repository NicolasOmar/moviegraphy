import type { GenresModel, MoviesModel, UsersModel } from '@models'

import * as z from 'zod'

// ---------- USERS / INTERFACES ----------
/** Used at `/components` and `/pages/api` for data handling */
export interface PasswordUpdateFormModel {
  new: string
  old: string
  repeatNew: string
}

/** Used at `/backend/api` for [UPDATE] API method */
export interface PasswordUpdateModel {
  newPassword: string
  oldPassword: string
  sessionToken: string
}

/** Used at `/components` and `/pages/api` for data handling */
export interface UserFormModel extends Omit<UsersModel, 'id'> {
  repeatPassword: string
}

/** Used at `/components` and `/pages/api` for data handling */
export type UserLoginFormModel = Pick<UsersModel, 'password' | 'username'>

/** Used at `/components` and `/pages/api` for data handling */
export type UserUpdateFormModel = Omit<UsersModel, 'email' | 'id' | 'password'> & TokenModel

interface TokenModel {
  sessionToken: string
}

// ---------- USERS / SCHEMAS ----------
/** Used at `/pages/api` for data validation */
export const UserCreateSchema = z.strictObject({
  email: z.email().max(50),
  name: z.string().max(25).optional(),
  password: z.string().min(4).max(25),
  repeatPassword: z.string().min(4).max(25),
  username: z.string().max(50)
})

/** Used at `/pages/api` for data validation */
export const UserUpdateSchema = z.strictObject({
  name: z.string().max(25).optional(),
  username: z.string().max(50)
})

/** Used at `/pages/api` for data validation */
export const PasswordUpdateSchema = z.strictObject({
  new: z.string(),
  old: z.string(),
  repeatNew: z.string()
})

/** Used at `/backend/api` for [CREATE] and [UPDATE] API methods */
export type GenreApiModel = GenreFormModel & TokenModel

// ---------- GENRES / INTERFACES ----------
/** Used at `/components` and `/pages/api` for data handling */
export type GenreFormModel = Omit<GenresModel, 'userId'>

// ---------- GENRES / SCHEMAS ----------
/** Used at `/pages/api` for data validation */
export const GenreCreateSchema = z.strictObject({
  name: z.string().max(300)
})

/** Used at `/backend/api` for [CREATE] and [UPDATE] API methods */
export type MovieApiModel = MovieFormModel & TokenModel

// ---------- MOVIES / INTERFACES ----------
/** Used at `/components` and `/pages/api` for data handling */
export type MovieFormModel = Omit<MoviesModel, 'userId'>

// ---------- MOVIES / SCHEMAS ----------
/** Used at `/pages/api` for data validation */
export const MovieCreateSchema = z.strictObject({
  countryMade: z.string(),
  description: z.string().max(300).optional(),
  name: z.string().max(150),
  releaseYear: z.coerce.number().min(1850).max(3000)
})

/** Used at `/pages/api` for data validation */
export const MovieUpdateSchema = z.strictObject({
  ...MovieCreateSchema.shape,
  id: z.uuid()
})
