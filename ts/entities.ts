import type { GenresModel, MoviesModel, UsersModel } from '@models'

import * as z from 'zod'

/** Used at Astro handling to obtain and handle logged user's id */
export type CustomAstroLocals = {
  loggedUserId: string
}

// ---------- USERS / INTERFACES ----------
/** Used at `/components` and `/pages/api` for data handling */
export type PasswordUpdateFormModel = {
  new: string
  old: string
  repeatNew: string
}

/** Used at `/backend/api` for [UPDATE] API method */
export type PasswordUpdateModel = CustomAstroLocals & {
  newPassword: string
  oldPassword: string
}

/** Used at `/components` and `/pages/api` for data handling */
export type UserFormModel = Omit<UsersModel, 'id'> & {
  repeatPassword: string
}

/** Used at `/components` and `/pages/api` for data handling */
export type UserLoginFormModel = Pick<UsersModel, 'password' | 'username'>

/** Used at `/components` and `/pages/api` for data handling */
export type UserUpdateFormModel = CustomAstroLocals & Omit<UsersModel, 'email' | 'id' | 'password'>

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

// ---------- GENRES / INTERFACES ----------
/** Used at `/backend/api` for [CREATE] and [UPDATE] API methods */
export type GenreApiModel = CustomAstroLocals & GenreFormModel

/** Used at `/components` and `/pages/api` for data handling */
export type GenreFormModel = Omit<GenresModel, 'userId'>

export type GenreWithMovieAmount = GenresModel & {
  moviesAmount?: number
}

// ---------- GENRES / SCHEMAS ----------
/** Used at `/pages/api` for data validation */
export const GenreCreateSchema = z.strictObject({
  name: z.string().max(300)
})

/** Used at `/pages/api` for data validation */
export const GenreUpdateSchema = z.strictObject({
  ...GenreCreateSchema.shape,
  id: z.uuid()
})

// ---------- MOVIES / INTERFACES ----------
/** Used at `/backend/api` for [CREATE] and [UPDATE] API methods */
export type MovieApiModel = CustomAstroLocals & MovieFormModel

/** Used at `/components` and `/pages/api` for data handling */
export type MovieFormModel = Omit<MoviesModel, 'userId'> & {
  genres: string | string[]
}

export type MovieWithGenresModel = MoviesModel & {
  genres?: GenresModel[]
}

// ---------- MOVIES / SCHEMAS ----------
/** Used at `/pages/api` for data validation */
export const MovieCreateSchema = z.strictObject({
  countryMade: z.string(),
  description: z.string().max(300).optional(),
  genres: z.string().optional(),
  name: z.string().max(150),
  releaseYear: z.coerce.number().min(1850).max(3000)
})

/** Used at `/pages/api` for data validation */
export const MovieUpdateSchema = z.strictObject({
  ...MovieCreateSchema.shape,
  id: z.uuid()
})
