import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { movieMocks } from '../../ts/mocks'
import { createMovie, deleteMovie, getMovieList, updateMovie } from './movies'
import prisma from './prisma'

vi.mock('./prisma')

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('getMovieList', () => {
  it('returns whatever mockedPrisma.movie.findMany resolves, called with no arguments', async () => {
    mockedPrisma.movie.findMany.mockResolvedValue(movieMocks)

    const result = await getMovieList()

    expect(mockedPrisma.movie.findMany).toHaveBeenCalledWith()
    expect(result).toEqual(movieMocks)
  })

  it('falls back to an empty list and logs a warning when the query rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockedPrisma.movie.findMany.mockRejectedValue(
      new Error('SASL: client password must be a string')
    )

    const result = await getMovieList()

    expect(result).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith(
      '[getMovieList] Prisma query failed, returning an empty list: SASL: client password must be a string'
    )
  })

  it('falls back to an empty list when a non-Error value is thrown', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockedPrisma.movie.findMany.mockRejectedValue('connection refused')

    const result = await getMovieList()

    expect(result).toEqual([])
  })
})

describe('createMovie', () => {
  it('creates a movie forwarding the given entity as data and returns the created record', async () => {
    const [movie] = movieMocks
    mockedPrisma.movie.create.mockResolvedValue(movie)

    const result = await createMovie(movie)

    expect(mockedPrisma.movie.create).toHaveBeenCalledWith({ data: movie })
    expect(result).toEqual(movie)
  })
})

describe('updateMovie', () => {
  it('strips the id out of data, uses it as the where clause, and returns the updated record', async () => {
    const [movie] = movieMocks
    const { id, ...dataToUpdate } = movie
    mockedPrisma.movie.update.mockResolvedValue(movie)

    const result = await updateMovie(movie)

    expect(mockedPrisma.movie.update).toHaveBeenCalledWith({ data: dataToUpdate, where: { id } })
    expect(result).toEqual(movie)
  })
})

describe('deleteMovie', () => {
  it('deletes by id and always resolves true regardless of what mockedPrisma.movie.delete resolves', async () => {
    const [movie] = movieMocks
    mockedPrisma.movie.delete.mockResolvedValue(movie)

    const result = await deleteMovie(movie.id)

    expect(mockedPrisma.movie.delete).toHaveBeenCalledWith({ where: { id: movie.id } })
    expect(result).toBe(true)
  })
})
