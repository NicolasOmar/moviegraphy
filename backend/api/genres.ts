import type { GenresModel } from '@models'
import type { GenreApiModel } from '@ts/entities'

import { HTTP_STATUS } from '@ts/constants'
import { parseApiErrorToHttpError } from '@ts/parsers'
import { type CreateOrUpdateOne, type GetMany, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'

/** `[CREATE]` function for genres
 *
 * - If the provided name on the genre has been already added, it will return an error
 *
 * @param _genreFormData - A `GenreApiModel` object to be created in the database
 * @returns The new `GenresModel`
 */
export const createGenre: CreateOrUpdateOne<GenreApiModel, GenresModel> = async ({
  loggedUserId,
  name
}) => {
  try {
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
        userId: loggedUserId
      }
    })
  } catch (_createGerneError) {
    throw parseApiErrorToHttpError(_createGerneError, '[POST /api/genres]')
  }
}

/** [UPDATE] function for genres
 *
 * - If the provided name on the genre has been already added, it will return an error
 *
 * @param _genreFormData - A `GenreApiModel` object to udpate an already created one
 * @returns The updated Genre as `GenresModel`
 */
export const updateGenre: CreateOrUpdateOne<GenreApiModel, GenresModel> = async ({
  id,
  loggedUserId,
  name
}) => {
  try {
    const isNameAlreadyUsed = await prismaInstance.genres.findUnique({
      where: { name }
    })

    if (isNameAlreadyUsed) {
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used')
    }

    return await prismaInstance.genres.update({
      data: { name },
      where: { id, userId: loggedUserId }
    })
  } catch (_updateGenreError) {
    throw parseApiErrorToHttpError(_updateGenreError, '[PATCH /api/genres]')
  }
}

/** `[GET]` function for genres registered by the logged user
 *
 * - Gets user's ids based on its session token
 *
 * @param _loggeduserId - Logged user's id to access its registered genres
 * @returns A list of `GenreModel`
 */
export const findGenres: GetMany<string, GenresModel> = async _loggeduserId => {
  try {
    return await prismaInstance.genres.findMany({ where: { userId: _loggeduserId } })
  } catch (_getGenreListError) {
    throw parseApiErrorToHttpError(_getGenreListError, '[GET /api/genres]')
  }
}
