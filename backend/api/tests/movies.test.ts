import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { movieMocks } from '../../../ts/mocks'
import prisma from '../../prisma'
import { createMovie, deleteMovie, getMovieList, updateMovie } from '../movies'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

const mockSessionFor = (userId: string) =>
  mockedPrisma.sessions.findFirst.mockResolvedValue({
    createdAt: new Date(),
    expiresAt: new Date(),
    id: 'session-id',
    token: 'hashed-token',
    userId
  })

describe('getMovieList', () => {
  it('resolves the movies owned by the session user', async () => {
    mockSessionFor(movieMocks[0].userId)
    mockedPrisma.movies.findMany.mockResolvedValue(movieMocks)

    const result = await getMovieList('raw-token')

    expect(mockedPrisma.movies.findMany).toHaveBeenCalledWith({
      where: { userId: movieMocks[0].userId }
    })
    expect(result).toEqual(movieMocks)
  })

  it('rejects with a 400 HttpError and never queries movies when the session token is unknown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(getMovieList('bad-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.movies.findMany).not.toHaveBeenCalled()
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockSessionFor(movieMocks[0].userId)
    mockedPrisma.movies.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(getMovieList('raw-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('createMovie', () => {
  it('creates a movie for the session owner without leaking the sessionToken into the stored data', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    mockSessionFor(userId)
    mockedPrisma.movies.create.mockResolvedValue(movie)

    const result = await createMovie({ ...movieForm, sessionToken: 'raw-token' })

    expect(mockedPrisma.movies.create).toHaveBeenCalledWith({
      data: { ...movieForm, userId }
    })
    expect(result).toEqual(movie)
  })

  it('rejects with a 400 HttpError and never creates when the session token is unknown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [movie] = movieMocks
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(createMovie({ ...movie, sessionToken: 'bad-token' })).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.movies.create).not.toHaveBeenCalled()
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userId, ...movieForm } = movieMocks[0]
    mockSessionFor(userId)
    mockedPrisma.movies.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(createMovie({ ...movieForm, sessionToken: 'raw-token' })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed')
    )
  })
})

describe('updateMovie', () => {
  it('strips the id and sessionToken out of data, scopes the where clause to the session owner, and returns the updated record', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    const { id, ...dataToUpdate } = movieForm
    mockSessionFor(userId)
    mockedPrisma.movies.update.mockResolvedValue(movie)

    const result = await updateMovie({ ...movieForm, sessionToken: 'raw-token' })

    expect(mockedPrisma.movies.update).toHaveBeenCalledWith({
      data: dataToUpdate,
      where: { id, userId }
    })
    expect(result).toEqual(movie)
  })

  it('rejects with a 400 HttpError and never updates when the session token is unknown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [movie] = movieMocks
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(updateMovie({ ...movie, sessionToken: 'bad-token' })).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.movies.update).not.toHaveBeenCalled()
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userId, ...movieForm } = movieMocks[0]
    mockSessionFor(userId)
    mockedPrisma.movies.update.mockRejectedValue(new Error('record not found'))

    await expect(updateMovie({ ...movieForm, sessionToken: 'raw-token' })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'record not found')
    )
  })
})

describe('deleteMovie', () => {
  it('deletes by id and always resolves true regardless of what mockedPrisma.movies.delete resolves', async () => {
    const [movie] = movieMocks
    mockedPrisma.movies.delete.mockResolvedValue(movie)

    const result = await deleteMovie(movie.id)

    expect(mockedPrisma.movies.delete).toHaveBeenCalledWith({ where: { id: movie.id } })
    expect(result).toBe(true)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [movie] = movieMocks
    mockedPrisma.movies.delete.mockRejectedValue(new Error('foreign key constraint failed'))

    await expect(deleteMovie(movie.id)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'foreign key constraint failed')
    )
  })
})
