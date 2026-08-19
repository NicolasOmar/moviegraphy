import type { APIContext } from 'astro'

import { getMovieWithGenres } from '@api/movies'
import { HTTP_STATUS, MOVIE_ERROR_MESSAGES } from '@ts/constants'
import { genreMocks, movieMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '../../movies/[id]'

vi.mock('@api/movies', () => ({
  getMovieWithGenres: vi.fn<typeof getMovieWithGenres>()
}))

const mockedGetMovieWithGenres = vi.mocked(getMovieWithGenres)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildContext = (id: string): APIContext => ({ params: { id } }) as unknown as APIContext

describe('GET', () => {
  it('forwards the route id to getMovieWithGenres and returns 200 with the resolved movie', async () => {
    const [movie] = movieMocks
    const movieWithGenres = { ...movie, genres: [genreMocks[0]] }
    mockedGetMovieWithGenres.mockResolvedValue(movieWithGenres)

    const response = await GET(buildContext(movie.id))

    expect(mockedGetMovieWithGenres).toHaveBeenCalledWith(movie.id)
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: movieWithGenres })
  })

  it('propagates the status and message carried by an HttpError when getMovieWithGenres rejects', async () => {
    mockedGetMovieWithGenres.mockRejectedValue(
      new HttpError(HTTP_STATUS.NOT_FOUND, MOVIE_ERROR_MESSAGES.NOT_FOUND)
    )

    const response = await GET(buildContext('missing-id'))

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
    expect(await response.json()).toEqual({ message: MOVIE_ERROR_MESSAGES.NOT_FOUND })
  })
})
