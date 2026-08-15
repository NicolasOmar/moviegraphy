import type { MoviesModel } from '@models'
import type { APIRoute } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { HTTP_STATUS } from '@ts/constants'
import {
  type CustomAstroLocals,
  MovieCreateSchema,
  type MovieFormModel,
  MovieUpdateSchema
} from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ locals, request }) => {
  const newMovieModel = await parseRequestToModel<MovieFormModel>(request)
  const movieCreationZod = await MovieCreateSchema.safeParseAsync(newMovieModel)

  if (movieCreationZod.error) {
    const movieCreateZodError = movieCreationZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(movieCreateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const movieCreated = (await createMovie({
      ...newMovieModel,
      id: v6(),
      loggedUserId: (locals as CustomAstroLocals).loggedUserId,
      releaseYear: +newMovieModel.releaseYear
    })) as MoviesModel

    return parseMessageToResponse(movieCreated, HTTP_STATUS.OK)
  } catch (_createMovieError) {
    return parseHttpErrorToResponse(_createMovieError)
  }
}

export const PATCH: APIRoute = async ({ locals, request }) => {
  const updateMovieModel = await parseRequestToModel<MoviesModel>(request)
  const movieUpdateZod = await MovieUpdateSchema.safeParseAsync(updateMovieModel)

  if (movieUpdateZod.error) {
    const movieUpdateZodError = movieUpdateZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(movieUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const movieUpdated = await updateMovie({
      ...updateMovieModel,
      loggedUserId: (locals as CustomAstroLocals).loggedUserId,
      releaseYear: +updateMovieModel.releaseYear
    })

    return parseMessageToResponse(movieUpdated, HTTP_STATUS.OK)
  } catch (_updateMovieError) {
    return parseHttpErrorToResponse(_updateMovieError)
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  const deleteMovieModel = await parseRequestToModel<{ id: string }>(request)

  try {
    const deleteMovieResponse = await deleteMovie(deleteMovieModel.id)

    return parseMessageToResponse(deleteMovieResponse, HTTP_STATUS.OK)
  } catch (_deleteMovieError) {
    return parseHttpErrorToResponse(_deleteMovieError)
  }
}
