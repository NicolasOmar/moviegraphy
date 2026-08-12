import type { GenresModel } from '@models'
import type { GenreWithToken } from '@ts/entities'

import { HTTP_STATUS } from '@ts/constants'
import { handleErrorMessage } from '@ts/parsers'
import { type CreateOrUpdateOne, type GetMany, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { findUserBySession } from './users'

/** `[CREATE]` function for genres
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
  } catch (error) {
    console.error('[POST /api/genres]', { error: error })

    if (error instanceof HttpError) {
      throw error
    }

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
