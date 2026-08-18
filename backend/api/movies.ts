import type { MoviesModel } from '@models'
import type { MovieApiModel } from '@ts/entities'

import { parseApiErrorToHttpError } from '@ts/parsers'
import { type CreateOrUpdateOne, type DeleteOne, type GetMany } from '@ts/types'

import prismaInstance from '../prisma'

/** `[GET]` function for registered movies
 *
 * @param _loggeduserId - Logged user's id to access its registered movies
 * @returns A list of `MoviesModel`
 */
export const getMovieList: GetMany<string, MoviesModel> = async _loggedUserId => {
  try {
    return await prismaInstance.movies.findMany({ where: { userId: _loggedUserId } })
  } catch (_getMovieListError) {
    throw parseApiErrorToHttpError(_getMovieListError, '[GET /api/movies]')
  }
}

/** `[CREATE]` function for movies
 *
 * @param _newMovie - A `MoviesModel` object to be inserted into the database
 * @returns The new `MoviesModel`
 */
export const createMovie: CreateOrUpdateOne<MovieApiModel, MoviesModel> = async _newMovie => {
  const { genres, loggedUserId, ...movieData } = _newMovie

  try {
    return await prismaInstance.movies.create({
      data: {
        ...movieData,
        genres: { create: genres.split(',').map(_genreId => ({ genreId: _genreId })) },
        userId: loggedUserId
      }
    })
  } catch (_createMovieError) {
    throw parseApiErrorToHttpError(_createMovieError, '[POST /api/movies]')
  }
}

/** `[UPDATE]` function for movies
 *
 * @param _modifiedMovie - A `MoviesModel` object to update an already created one
 * @returns The updated Movie as `MoviesModel`
 */
export const updateMovie: CreateOrUpdateOne<MovieApiModel, MoviesModel> = async _modifiedMovie => {
  const { genres, id: movieId, loggedUserId, ...dataToUpdate } = _modifiedMovie

  try {
    return await prismaInstance.movies.update({
      data: {
        ...dataToUpdate,
        genres: {
          create: genres.split(',').map(_genreId => ({ genreId: _genreId })),
          deleteMany: {}
        }
      },
      where: { id: movieId, userId: loggedUserId }
    })
  } catch (_updateMovieError) {
    throw parseApiErrorToHttpError(_updateMovieError, '[PATCH /api/movies]')
  }
}

/** `[DELETE]` function for a single movie
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
