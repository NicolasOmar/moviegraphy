import type { MoviesModel } from '@models'
import type { CreateMovieForm } from '@ts/entities'

import { parseApiErrorToHttpError } from '@ts/parsers'
import { type CreateOrUpdateOne, type DeleteOne, type GetMany } from '@ts/types'

import prismaInstance from '../prisma'
import { findUserBySession } from './users'

/** `[GET]` function for registered movies
 *
 * @returns A list of `MoviesModel`
 */
export const getMovieList: GetMany<string, MoviesModel> = async _sessionToken => {
  try {
    const findedUserId = await findUserBySession(_sessionToken)

    return await prismaInstance.movies.findMany({ where: { userId: findedUserId } })
  } catch (_getMovieListError) {
    throw parseApiErrorToHttpError(_getMovieListError, '[GET /api/movies]')
  }
}

/** `[CREATE]` function for movies
 *
 * @param _newMovie - A `MoviesModel` object to be inserted into the database
 * @returns The new `MoviesModel`
 */
export const createMovie: CreateOrUpdateOne<CreateMovieForm, MoviesModel> = async _newMovie => {
  const { sessionToken, ...movieData } = _newMovie

  try {
    const findedUserId = await findUserBySession(sessionToken)
    return await prismaInstance.movies.create({
      data: {
        ...movieData,
        userId: findedUserId
      }
    })
  } catch (_createMovieError) {
    throw parseApiErrorToHttpError(_createMovieError, '[POST /api/movies]')
  }
}

/** `[UPDATE]` function for movies
 *
 * @param _modifiedMovie - A `MoviesModel` object to update an already created one
 * @returns The updated `MoviesModel`
 */
export const updateMovie: CreateOrUpdateOne<
  CreateMovieForm,
  MoviesModel
> = async _modifiedMovie => {
  const { id: movieId, sessionToken, ...dataToUpdate } = _modifiedMovie

  try {
    const findedUserId = await findUserBySession(sessionToken)

    return await prismaInstance.movies.update({
      data: dataToUpdate,
      where: { id: movieId, userId: findedUserId }
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
