import type { APIRoute } from 'astro'

import { getMovieWithGenres } from '@api/movies'
import { type CustomAstroLocals } from '@ts-types/entities'
import { HTTP_STATUS } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse } from '@ts/parsers'

export const GET: APIRoute = async ({ locals, params }) => {
  const movieId = params.id as string

  try {
    const movieCreated = await getMovieWithGenres({
      loggedUserId: (locals as CustomAstroLocals).loggedUserId,
      movieId
    })

    return parseMessageToResponse(movieCreated, HTTP_STATUS.OK)
  } catch (_getMovieWithGenresError) {
    return parseHttpErrorToResponse(_getMovieWithGenresError)
  }
}
