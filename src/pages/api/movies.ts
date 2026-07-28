export const prerender = false
import type { MovieModel } from '@models'
import type { APIRoute } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { HTTP_STATUS } from '@ts/constants'
import { MovieCreateSchema, MovieUpdateSchema } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ request }) => {
  const newMovieModel = await parseRequestToModel<MovieModel>(request)

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

export const PATCH: APIRoute = async ({ request }) => {
  const updateMovieModel = await parseRequestToModel<MovieModel>(request)

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
