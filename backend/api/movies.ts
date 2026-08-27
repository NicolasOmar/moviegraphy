import type { MoviesModel } from '@models'
import type { MovieApiModel, MovieWithGenresModel } from '@ts-types/entities'

import {
  type CreateOrUpdateOne,
  type DeleteOne,
  type GetMany,
  type GetOne,
  HttpError
} from '@ts-types/api'
import { HTTP_STATUS, MOVIE_ERROR_MESSAGES } from '@ts/constants'
import { parseApiErrorToHttpError, parseIdStringToArray } from '@ts/parsers'

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

/** `[GET]` function for a single movie, including its related genres
 *
 * - Scoped to the logged user, so a movie id belonging to another user is never returned
 *
 * @param _movieId - A string related to an existing movie in the database
 * @param _loggedUserId - Logged user's id to scope the lookup to its own movies
 * @returns The `MovieWithGenresModel` matching `_movieId`
 */
export const getMovieWithGenres: GetOne<
  { loggedUserId: string; movieId: string },
  MovieWithGenresModel
> = async ({ loggedUserId, movieId }) => {
  try {
    const movieWithGenres = await prismaInstance.movies.findUnique({
      include: { genres: { include: { genre: true } } },
      where: { id: movieId, userId: loggedUserId }
    })

    if (!movieWithGenres) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, MOVIE_ERROR_MESSAGES.NOT_FOUND)
    }

    return { ...movieWithGenres, genres: movieWithGenres.genres.map(({ genre }) => genre) }
  } catch (_getMovieWithGenresError) {
    throw parseApiErrorToHttpError(_getMovieWithGenresError, '[GET /api/movies]')
  }
}

/** `[CREATE]` function for movies
 *
 * @param _newMovie - A `MovieApiModel` object to be inserted into the database
 * @returns The new `MoviesModel`
 */
export const createMovie: CreateOrUpdateOne<MovieApiModel, MoviesModel> = async _newMovie => {
  const { genres, loggedUserId, ...movieData } = _newMovie
  const parsedGenres = parseIdStringToArray(genres).map(_genreId => ({ genreId: _genreId }))

  try {
    return await prismaInstance.movies.create({
      data: {
        ...movieData,
        genres: { create: parsedGenres },
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
  const parsedGenres = parseIdStringToArray(genres).map(_genreId => ({ genreId: _genreId }))

  try {
    const [, updatedMovie] = await prismaInstance.$transaction([
      prismaInstance.genresOnMovies.deleteMany({ where: { movieId } }),
      prismaInstance.movies.update({
        data: {
          ...dataToUpdate,
          genres: { create: parsedGenres }
        },
        where: { id: movieId, userId: loggedUserId }
      })
    ])

    return updatedMovie
  } catch (_updateMovieError) {
    throw parseApiErrorToHttpError(_updateMovieError, '[PATCH /api/movies]')
  }
}

/** `[DELETE]` function for a single movie
 *
 * @param _movieId - A string related to an existing movie in the database
 * @returns A boolean `true`
 */
export const deleteMovie: DeleteOne = async _movieId => {
  try {
    await prismaInstance.movies.delete({ where: { id: _movieId } })

    return true
  } catch (_deleteMovieError) {
    throw parseApiErrorToHttpError(_deleteMovieError, '[DELETE /api/movies]')
  }
}
