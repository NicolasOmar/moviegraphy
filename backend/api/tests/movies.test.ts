import { HTTP_STATUS } from '@ts/constants'
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

describe('getMovieList', () => {
  it('resolves the movies owned by the logged user', async () => {
    mockedPrisma.movies.findMany.mockResolvedValue(movieMocks)

    const result = await getMovieList(movieMocks[0].userId)

    expect(mockedPrisma.movies.findMany).toHaveBeenCalledWith({
      where: { userId: movieMocks[0].userId }
    })
    expect(result).toEqual(movieMocks)
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.movies.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(getMovieList(movieMocks[0].userId)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('createMovie', () => {
  it('creates a movie for the logged user without leaking the loggedUserId into the stored data', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    mockedPrisma.movies.create.mockResolvedValue(movie)

    const result = await createMovie({ ...movieForm, loggedUserId: userId })

    expect(mockedPrisma.movies.create).toHaveBeenCalledWith({
      data: { ...movieForm, userId }
    })
    expect(result).toEqual(movie)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userId, ...movieForm } = movieMocks[0]
    mockedPrisma.movies.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(createMovie({ ...movieForm, loggedUserId: userId })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed')
    )
  })
})

describe('updateMovie', () => {
  it('strips the id and loggedUserId out of data, scopes the where clause to the logged user, and returns the updated record', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    const { id, ...dataToUpdate } = movieForm
    mockedPrisma.movies.update.mockResolvedValue(movie)

    const result = await updateMovie({ ...movieForm, loggedUserId: userId })

    expect(mockedPrisma.movies.update).toHaveBeenCalledWith({
      data: dataToUpdate,
      where: { id, userId }
    })
    expect(result).toEqual(movie)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userId, ...movieForm } = movieMocks[0]
    mockedPrisma.movies.update.mockRejectedValue(new Error('record not found'))

    await expect(updateMovie({ ...movieForm, loggedUserId: userId })).rejects.toEqual(
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
