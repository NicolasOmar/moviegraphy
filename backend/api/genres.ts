import type { GenresModel } from '@models'
import type { CreateGenreForm } from '@ts/entities'

import { HTTP_STATUS } from '@ts/constants'
import { parseApiErrorToHttpError } from '@ts/parsers'
import { type CreateOrUpdateOne, type GetMany, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { findUserBySession } from './users'

/** `[CREATE]` function for genres
 *
 * - If the provided name on the genre has been already added, it will return an error
 *
 * @param _genreFormData - A `CreateGenreForm` object to be created in the database
 * @returns The new `GenresModel`
 */
export const createGenre: CreateOrUpdateOne<CreateGenreForm, GenresModel> = async ({
  name,
  sessionToken
}) => {
  try {
    const findedUserId = await findUserBySession(sessionToken)

    const alreadyUsedName = await prismaInstance.genres.findUnique({
      where: { name }
    })

    if (alreadyUsedName) {
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used')
    }

    return await prismaInstance.genres.create({
      data: {
        id: v6(),
        name,
        userId: findedUserId as string
      }
    })
  } catch (_createGerneError) {
    throw parseApiErrorToHttpError(_createGerneError, '[POST /api/genres]')
  }
}

/** `[GET]` function for genres registered by the logged user
 *
 * - Gets user's ids based on its session token
 *
 * @param _sessionToken - Logged user's session token to access its registered genres
 * @returns A list of `GenreModel`
 */
export const findGenres: GetMany<string, GenresModel> = async _sessionToken => {
  try {
    const findedUserId = await findUserBySession(_sessionToken)

    return await prismaInstance.genres.findMany({ where: { userId: findedUserId } })
  } catch (_getGenreListError) {
    throw parseApiErrorToHttpError(_getGenreListError, '[GET /api/genres]')
  }
}
