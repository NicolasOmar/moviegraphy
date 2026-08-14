import type { APIRoute } from 'astro'

import { createGenre, updateGenre } from '@api/genres'
import { HTTP_STATUS } from '@ts/constants'
import {
  type CustomAstroLocals,
  GenreCreateSchema,
  type GenreFormModel,
  GenreUpdateSchema
} from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ locals, request }) => {
  const newGenreModel = await parseRequestToModel<GenreFormModel>(request)
  const genreCreationZod = await GenreCreateSchema.safeParseAsync(newGenreModel)

  if (genreCreationZod.error) {
    const genreCreateZodError = genreCreationZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(genreCreateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const genreCreated = await createGenre({
      ...newGenreModel,
      loggedUserId: (locals as CustomAstroLocals).loggedUserId
    })

    return parseMessageToResponse(genreCreated, HTTP_STATUS.OK)
  } catch (_createGenreError) {
    return parseHttpErrorToResponse(_createGenreError)
  }
}

export const PATCH: APIRoute = async ({ locals, request }) => {
  const updatedGenreModel = await parseRequestToModel<GenreFormModel>(request)
  const genreUpdateZod = await GenreUpdateSchema.safeParseAsync(updatedGenreModel)

  if (genreUpdateZod.error) {
    const genreUpdateZodError = genreUpdateZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(genreUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const genreUpdated = await updateGenre({
      ...updatedGenreModel,
      loggedUserId: (locals as CustomAstroLocals).loggedUserId
    })

    return parseMessageToResponse(genreUpdated, HTTP_STATUS.OK)
  } catch (_updateGenreError) {
    return parseHttpErrorToResponse(_updateGenreError)
  }
}
