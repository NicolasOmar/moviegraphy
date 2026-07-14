import type { APIContext } from 'astro'

import { createMovie, deleteMovie, updateMovie } from '@api/movies'
import { movieMocks } from '@ts/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE, PATCH, POST } from '../movie'

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
    request: new Request('http://localhost/api/movie', { body: formData, method })
  }) as APIContext

describe('POST', () => {
  it('parses form data, generates an id, coerces releaseYear to a number, and returns 200', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('name', movie.name)
    formData.append('description', movie.description)
    formData.append('countryMade', movie.countryMade)
    formData.append('releaseYear', String(movie.releaseYear))

    const response = await POST(buildContext(formData, 'POST'))

    expect(mockedCreateMovie).toHaveBeenCalledWith({
      countryMade: movie.countryMade,
      description: movie.description,
      id: 'fixed-test-id',
      name: movie.name,
      releaseYear: movie.releaseYear
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Success!' })
  })
})

describe('PATCH', () => {
  it('parses form data and coerces releaseYear to a number before forwarding to updateMovie', async () => {
    const [movie] = movieMocks
    const formData = new FormData()
    formData.append('id', movie.id)
    formData.append('name', movie.name)
    formData.append('description', movie.description)
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
})
