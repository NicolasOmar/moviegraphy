import type { MoviesModel } from '@models'

import { parseApiErrorToHttpError } from '@ts/parsers'
import { type CreateOrUpdateOne, type DeleteOne, type GetManyOld } from '@ts/types'

import prismaInstance from '../prisma'

/** `[GET]` function for registered movies
 *
 * @returns A list of `MoviesModel`
 */
export const getMovieList: GetManyOld<MoviesModel> = async () => {
  try {
    return await prismaInstance.movies.findMany()
  } catch (_getMovieListError) {
    throw parseApiErrorToHttpError(_getMovieListError, '[GET /api/movies]')
  }
}

/** `[CREATE]` function for movies
 *
 * @param _newMovie - A `MoviesModel` object to be inserted into the database
 * @returns The new `MoviesModel`
 */
export const createMovie: CreateOrUpdateOne<MoviesModel> = async _newMovie => {
  try {
    return await prismaInstance.movies.create({ data: _newMovie })
  } catch (_createMovieError) {
    throw parseApiErrorToHttpError(_createMovieError, '[POST /api/movies]')
  }
}

/** `[UPDATE]` function for movies
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
  } catch (_updateMovieError) {
    throw parseApiErrorToHttpError(_updateMovieError, '[PATCH /api/movies]')
  }
}

/** `[DELETE]` function for movies
 *
 * @param _movieId - A string related to an existing movie in the database
 * @returns A `true`
 */
export const deleteMovie: DeleteOne = async _movieId => {
  try {
    await prismaInstance.movies.delete({ where: { id: _movieId } })

    return true
  } catch (_deleteMovieError) {
    throw parseApiErrorToHttpError(_deleteMovieError, '[DELETE /api/movies]')
  }
}
