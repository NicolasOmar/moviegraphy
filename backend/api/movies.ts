import type { MoviesModel } from '@models'

import { HTTP_STATUS } from '@ts/constants'
import { handleErrorMessage } from '@ts/parsers'
import { type CreateOrUpdateOne, type DeleteOne, type GetMany, HttpError } from '@ts/types'

import prismaInstance from '../prisma'

export const getMovieList: GetMany<MoviesModel> = async () => {
  try {
    return await prismaInstance.movies.findMany()
  } catch (error) {
    const errorMessage = handleErrorMessage(error)

    console.error('[GET /api/movies]', { errorMessage })

    return []
  }
}

export const createMovie: CreateOrUpdateOne<MoviesModel> = async newMovie => {
  try {
    return await prismaInstance.movies.create({ data: newMovie })
  } catch (error) {
    console.error('[POST /api/movies]', { error })

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

export const updateMovie: CreateOrUpdateOne<MoviesModel> = async modifiedMovie => {
  const { id: movieId, ...dataToUpdate } = modifiedMovie

  try {
    return await prismaInstance.movies.update({
      data: dataToUpdate,
      where: { id: movieId }
    })
  } catch (error) {
    console.error('[PATCH /api/movies]', { error })

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

export const deleteMovie: DeleteOne = async id => {
  try {
    console.info('[DELETE /api/movies]', { id })

    await prismaInstance.movies.delete({ where: { id } })

    return new Promise(resolve => resolve(true))
  } catch (error) {
    console.error('[DELETE /api/movies]', { error })

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
