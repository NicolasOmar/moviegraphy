import type { GenresModel } from '@models'
import type { GenreWithToken } from '@ts/entities'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { handleErrorMessage } from '@ts/parsers'
import { type CreateOrUpdateOne, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { findUserBySession } from './users'

/** CREATE function for genres
 *
 * - If the provided name on the genre has been already added, it will return an error
 *
 * @param _genreWithToken - A `GenreWithToken` object to be created in the database
 * @returns The new `GenresModel`
 */
export const createGenre: CreateOrUpdateOne<
  GenreWithToken,
  GenresModel
> = async _genreWithToken => {
  try {
    const findedUserId = await findUserBySession(_genreWithToken.sessionToken)

    if (!findedUserId) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const alreadyUsedName = await prismaInstance.genres.findUnique({
      where: { name: _genreWithToken.name }
    })

    if (alreadyUsedName) {
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used')
    }

    return await prismaInstance.genres.create({
      data: {
        id: v6(),
        name: _genreWithToken.name,
        userId: findedUserId as string
      }
    })
  } catch (createGerneError) {
    console.error('[POST /api/genres]', { error: createGerneError })

    if (createGerneError instanceof HttpError) {
      throw createGerneError
    }

    const errorMessage = handleErrorMessage(createGerneError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
