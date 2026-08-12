import type { MoviesModel } from '@models'

import { HTTP_STATUS } from '@ts/constants'
import { handleErrorMessage } from '@ts/parsers'
import { type CreateOrUpdateOne, type DeleteOne, type GetMany, HttpError } from '@ts/types'

import prismaInstance from '../prisma'

/** GET function for registered movies
 *
 * @returns A list of `MoviesModel`
 */
export const getMovieList: GetMany<MoviesModel> = async () => {
  try {
    return await prismaInstance.movies.findMany()
  } catch (error) {
    const errorMessage = handleErrorMessage(error)

    console.error('[GET /api/movies]', { errorMessage })

    return []
  }
}

/** CREATE function for movies
 *
 * @param _newMovie - A `MoviesModel` object to be created in the database
 * @returns The new `MoviesModel`
 */
export const createMovie: CreateOrUpdateOne<MoviesModel> = async _newMovie => {
  try {
    return await prismaInstance.movies.create({ data: _newMovie })
  } catch (error) {
    console.error('[POST /api/movies]', { error })

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

/** UPDATE function for movies
 *
 * @param _modifiedMovie - A `MoviesModel` object to update an already created one
 * @returns The updated `MoviesModel`
 */
export const updateMovie: CreateOrUpdateOne<MoviesModel> = async _modifiedMovie => {
  const { id: movieId, ...dataToUpdate } = _modifiedMovie

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

/** DELETE function for movies
 *
 * @param _movieId - A string related to an existing movie in the database
 * @returns A true value when the movie has been deleted from the database
 */
export const deleteMovie: DeleteOne = async _movieId => {
  try {
    await prismaInstance.movies.delete({ where: { id: _movieId } })

    return new Promise(resolve => resolve(true))
  } catch (error) {
    console.error('[DELETE /api/movies]', { error })

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
