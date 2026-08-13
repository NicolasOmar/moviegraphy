import type { MoviesModel } from '@models'
import type { APIRoute } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { MovieCreateSchema, type MovieFormModel, MovieUpdateSchema } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value as string
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
      releaseYear: +newMovieModel.releaseYear,
      sessionToken
    })) as MoviesModel

    return parseMessageToResponse(movieCreated, HTTP_STATUS.OK)
  } catch (apiCreateError) {
    return parseHttpErrorToResponse(apiCreateError)
  }
}

export const PATCH: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value as string
  const updateMovieModel = await parseRequestToModel<MoviesModel>(request)
  const movieUpdateZod = await MovieUpdateSchema.safeParseAsync(updateMovieModel)

  if (movieUpdateZod.error) {
    const movieUpdateZodError = movieUpdateZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(movieUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const movieUpdated = await updateMovie({
      ...updateMovieModel,
      releaseYear: +updateMovieModel.releaseYear,
      sessionToken
    })

    return parseMessageToResponse(movieUpdated, HTTP_STATUS.OK)
  } catch (apiUpdateError) {
    return parseHttpErrorToResponse(apiUpdateError)
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  const deleteMovieModel = await parseRequestToModel<{ id: string }>(request)

  try {
    await deleteMovie(deleteMovieModel.id)

    return parseMessageToResponse(true, HTTP_STATUS.OK)
  } catch (apiDeleteError) {
    return parseHttpErrorToResponse(apiDeleteError)
  }
}
