import type { GenresModel } from '@models'
import type { GenreWithToken } from '@ts/entities'

import prismaInstance from '@prisma/index'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { handleErrorMessage } from '@ts/parsers'
import { type CreateOrUpdateOne, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import { findUserBySession } from './users'

export const createGenre: CreateOrUpdateOne<
  GenreWithToken,
  GenresModel
> = async _genreWithToken => {
  try {
    const findedUserId = await findUserBySession(_genreWithToken.sessionToken)

    if (!findedUserId) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const createdGenreResponse = await prismaInstance.genres.create({
      data: {
        id: v6(),
        name: _genreWithToken.name,
        userId: findedUserId as string
      }
    })

    return createdGenreResponse
  } catch (createGerneError) {
    console.error('[POST /api/genres]', { error: createGerneError })

    if (createGerneError instanceof HttpError) {
      throw createGerneError
    }

    const errorMessage = handleErrorMessage(createGerneError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
