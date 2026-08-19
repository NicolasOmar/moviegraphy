import type { APIRoute } from 'astro'

import { getMovieWithGenres } from '@api/movies'
import { HTTP_STATUS } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse } from '@ts/parsers'

export const GET: APIRoute = async ({ params }) => {
  const movieId = params.id as string

  try {
    const movieCreated = await getMovieWithGenres(movieId)

    return parseMessageToResponse(movieCreated, HTTP_STATUS.OK)
  } catch (_getMovieWithGenresError) {
    return parseHttpErrorToResponse(_getMovieWithGenresError)
  }
}
