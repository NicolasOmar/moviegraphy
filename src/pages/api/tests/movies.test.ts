import type { APIContext } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { HTTP_STATUS } from '@ts/constants'
import { movieMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE, PATCH, POST } from '../movies'

vi.mock('@api/movies', () => ({
  createMovie: vi.fn<typeof createMovie>(),
  deleteMovie: vi.fn<typeof deleteMovie>(),
  updateMovie: vi.fn<typeof updateMovie>()
}))

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

const mockedCreateMovie = vi.mocked(createMovie)
const mockedUpdateMovie = vi.mocked(updateMovie)
const mockedDeleteMovie = vi.mocked(deleteMovie)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildContext = (formData: FormData, method: string): APIContext =>
  ({
    cookies: { get: vi.fn().mockReturnValue({ value: 'raw-token' }) },
    request: new Request('http://localhost/api/movie', { body: formData, method })
  }) as unknown as APIContext

describe('POST', () => {
  it('parses form data, generates an id, coerces releaseYear to a number, and returns 200', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('name', movie.name)
    formData.append('description', movie.description ?? '')
    formData.append('countryMade', movie.countryMade)
    formData.append('releaseYear', String(movie.releaseYear))

    mockedCreateMovie.mockResolvedValue(movie)

    const response = await POST(buildContext(formData, 'POST'))

    expect(mockedCreateMovie).toHaveBeenCalledWith({
      countryMade: movie.countryMade,
      description: movie.description,
      id: 'fixed-test-id',
      name: movie.name,
      releaseYear: movie.releaseYear
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: movie })
  })

  it('returns 400 with the joined Zod issue messages when the payload fails schema validation', async () => {
    const formData = new FormData()
    formData.append('name', 'The Matrix')
    formData.append('description', '')
    formData.append('countryMade', 'USA')
    formData.append('releaseYear', '100')

    const response = await POST(buildContext(formData, 'POST'))

    expect(mockedCreateMovie).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too small: expected number to be >=1850']
    })
  })

  it('propagates the status and message carried by an HttpError when createMovie rejects', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('name', movie.name)
    formData.append('description', movie.description ?? '')
    formData.append('countryMade', movie.countryMade)
    formData.append('releaseYear', String(movie.releaseYear))
    mockedCreateMovie.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'create failed')
    )

    const response = await POST(buildContext(formData, 'POST'))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'create failed' })
  })
})

describe('PATCH', () => {
  it('parses form data and coerces releaseYear to a number before forwarding to updateMovie', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('id', movie.id)
    formData.append('name', movie.name)
    formData.append('description', movie.description ?? '')
    formData.append('countryMade', movie.countryMade)
    formData.append('releaseYear', String(movie.releaseYear))

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(mockedUpdateMovie).toHaveBeenCalledWith({
      countryMade: movie.countryMade,
      description: movie.description,
      id: movie.id,
      name: movie.name,
      releaseYear: movie.releaseYear
    })
    expect(response.status).toBe(200)
  })

  it('returns 400 with the joined Zod issue messages when the payload fails schema validation', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('id', movie.id)
    formData.append('name', movie.name)
    formData.append('description', movie.description ?? '')
    formData.append('countryMade', movie.countryMade)
    formData.append('releaseYear', '100')

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(mockedUpdateMovie).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too small: expected number to be >=1850']
    })
  })

  it('propagates the status and message carried by an HttpError when updateMovie rejects', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('id', movie.id)
    formData.append('name', movie.name)
    formData.append('description', movie.description ?? '')
    formData.append('countryMade', movie.countryMade)
    formData.append('releaseYear', String(movie.releaseYear))
    mockedUpdateMovie.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'update failed')
    )

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'update failed' })
  })
})

describe('DELETE', () => {
  it('parses just the id and forwards it to deleteMovie, returning 200', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('id', movie.id)

    const response = await DELETE(buildContext(formData, 'DELETE'))

    expect(mockedDeleteMovie).toHaveBeenCalledWith(movie.id)
    expect(response.status).toBe(200)
  })

  it('propagates the status and message carried by an HttpError when deleteMovie rejects', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('id', movie.id)
    mockedDeleteMovie.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'delete failed')
    )

    const response = await DELETE(buildContext(formData, 'DELETE'))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'delete failed' })
  })
})
