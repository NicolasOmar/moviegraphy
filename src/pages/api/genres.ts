import type { APIRoute } from 'astro'

import { createGenre, updateGenre } from '@api/genres'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { GenreCreateSchema, type GenreFormModel, GenreUpdateSchema } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value as string
  const newGenreModel = await parseRequestToModel<GenreFormModel>(request)
  const genreCreationZod = await GenreCreateSchema.safeParseAsync(newGenreModel)

  if (genreCreationZod.error) {
    const genreCreateZodError = genreCreationZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(genreCreateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const genreCreated = await createGenre({
      ...newGenreModel,
      sessionToken
    })

    return parseMessageToResponse(genreCreated, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}

export const PATCH: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value as string
  const updatedGenreModel = await parseRequestToModel<GenreFormModel>(request)
  const genreUpdateZod = await GenreUpdateSchema.safeParseAsync(updatedGenreModel)

  if (genreUpdateZod.error) {
    const genreUpdateZodError = genreUpdateZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(genreUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const genreUpdated = await updateGenre({
      ...updatedGenreModel,
      sessionToken
    })

    return parseMessageToResponse(genreUpdated, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}
