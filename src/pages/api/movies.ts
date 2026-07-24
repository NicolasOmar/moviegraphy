export const prerender = false
import type { MovieModel } from '@models'
import type { APIRoute } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { MovieCreateSchema, MovieUpdateSchema } from '@schemas/user'
import { HTTP_STATUS } from '@ts/constants'
import { parseFormDataToModel, parseHttpErrorToResponse, parseMessageToResponse } from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ request }) => {
  const newMovieFormData = await request.formData()
  const newMovieModel = parseFormDataToModel<MovieModel>(newMovieFormData)

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
  const updateMovieFormData = await request.formData()
  const updateMovieModel = parseFormDataToModel<MovieModel>(updateMovieFormData)

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
  const deleteMovieFormData = await request.formData()
  const deleteMovieModel = parseFormDataToModel<{ id: string }>(deleteMovieFormData)

  try {
    await deleteMovie(deleteMovieModel.id)

    return parseMessageToResponse(true, HTTP_STATUS.OK)
  } catch (apiDeleteError) {
    return parseHttpErrorToResponse(apiDeleteError)
  }
}
