import type { MoviesModel } from '@models'
import type { APIRoute } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { isSessionValid } from '@api/sessions'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { MovieCreateSchema, MovieUpdateSchema } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value
  const tokenResponse = await isSessionValid(sessionToken)

  if (!tokenResponse) {
    return parseMessageToResponse('No token provided', HTTP_STATUS.BAD_REQUEST)
  }

  const newMovieModel = await parseRequestToModel<MoviesModel>(request)

  const { error: zodError } = await MovieCreateSchema.safeParseAsync(newMovieModel)

  if (zodError) {
    const movieCreateZodMessage = zodError.issues.map(({ message }) => message)
    return parseMessageToResponse(movieCreateZodMessage, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const movieCreated = await createMovie({
      ...newMovieModel,
      id: v6(),
      releaseYear: +newMovieModel.releaseYear
    })

    return parseMessageToResponse(movieCreated, HTTP_STATUS.OK)
  } catch (apiCreateError) {
    return parseHttpErrorToResponse(apiCreateError)
  }
}

export const PATCH: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value
  const tokenResponse = await isSessionValid(sessionToken)

  if (!tokenResponse) {
    return parseMessageToResponse('No token provided', HTTP_STATUS.BAD_REQUEST)
  }

  const updateMovieModel = await parseRequestToModel<MoviesModel>(request)

  const { error: zodError } = await MovieUpdateSchema.safeParseAsync(updateMovieModel)

  if (zodError) {
    const movieUpdateZodError = zodError.issues.map(({ message }) => message)
    return parseMessageToResponse(movieUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const movieUpdated = await updateMovie({
      ...updateMovieModel,
      releaseYear: +updateMovieModel.releaseYear
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
