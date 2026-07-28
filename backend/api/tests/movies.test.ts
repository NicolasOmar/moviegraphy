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
  it('returns whatever mockedPrisma.movies.findMany resolves, called with no arguments', async () => {
    mockedPrisma.movies.findMany.mockResolvedValue(movieMocks)

    const result = await getMovieList()

    expect(mockedPrisma.movies.findMany).toHaveBeenCalledWith()
    expect(result).toEqual(movieMocks)
  })

  it('falls back to an empty list when the query rejects with an Error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.movies.findMany.mockRejectedValue(
      new Error('SASL: client password must be a string')
    )

    const result = await getMovieList()

    expect(result).toEqual([])
  })

  it('falls back to an empty list when a non-Error value is thrown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.movies.findMany.mockRejectedValue('connection refused')

    const result = await getMovieList()

    expect(result).toEqual([])
  })
})

describe('createMovie', () => {
  it('creates a movie forwarding the given entity as data and returns the created record', async () => {
    const [movie] = movieMocks
    mockedPrisma.movies.create.mockResolvedValue(movie)

    const result = await createMovie(movie)

    expect(mockedPrisma.movies.create).toHaveBeenCalledWith({ data: movie })
    expect(result).toEqual(movie)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [movie] = movieMocks
    mockedPrisma.movies.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(createMovie(movie)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed')
    )
  })
})

describe('updateMovie', () => {
  it('strips the id out of data, uses it as the where clause, and returns the updated record', async () => {
    const [movie] = movieMocks
    const { id, ...dataToUpdate } = movie
    mockedPrisma.movies.update.mockResolvedValue(movie)

    const result = await updateMovie(movie)

    expect(mockedPrisma.movies.update).toHaveBeenCalledWith({ data: dataToUpdate, where: { id } })
    expect(result).toEqual(movie)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [movie] = movieMocks
    mockedPrisma.movies.update.mockRejectedValue(new Error('record not found'))

    await expect(updateMovie(movie)).rejects.toEqual(
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
