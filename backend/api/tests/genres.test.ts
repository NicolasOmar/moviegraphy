import { HTTP_STATUS } from '@ts/constants'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { genreMocks } from '../../../ts/mocks'
import prisma from '../../prisma'
import { createGenre, deleteGenre, getGenreList, updateGenre } from '../genres'

vi.mock('../../prisma', () => import('../mocks/prisma'))
vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('createGenre', () => {
  it('creates a genre for the logged user once the name is free, generating a new id', async () => {
    const [genre] = genreMocks
    mockedPrisma.genres.findUnique.mockResolvedValue(null)
    mockedPrisma.genres.create.mockResolvedValue(genre)

    const result = await createGenre({
      id: genre.id,
      loggedUserId: genre.userId,
      name: genre.name
    })

    expect(mockedPrisma.genres.findUnique).toHaveBeenCalledWith({ where: { name: genre.name } })
    expect(mockedPrisma.genres.create).toHaveBeenCalledWith({
      data: { id: 'fixed-test-id', name: genre.name, userId: genre.userId }
    })
    expect(result).toEqual(genre)
  })

  it('rejects with a 500 HttpError and never creates when the genre name is already taken', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockedPrisma.genres.findUnique.mockResolvedValue(genre)

    await expect(
      createGenre({ id: genre.id, loggedUserId: genre.userId, name: genre.name })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used'))
    expect(mockedPrisma.genres.create).not.toHaveBeenCalled()
  })

  it('wraps a rejection from genres.create into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockedPrisma.genres.findUnique.mockResolvedValue(null)
    mockedPrisma.genres.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(
      createGenre({ id: genre.id, loggedUserId: genre.userId, name: genre.name })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed'))
  })

  it('wraps a non-Error rejection from genres.findUnique into a 500 HttpError with the stringified value', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockedPrisma.genres.findUnique.mockRejectedValue('connection refused')

    await expect(
      createGenre({ id: genre.id, loggedUserId: genre.userId, name: genre.name })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused'))
  })
})

describe('updateGenre', () => {
  it('updates a genre owned by the logged user once the new name is free', async () => {
    const [genre] = genreMocks
    const updatedGenre = { ...genre, name: 'Sci-Fi Renamed' }
    mockedPrisma.genres.findUnique.mockResolvedValue(null)
    mockedPrisma.genres.update.mockResolvedValue(updatedGenre)

    const result = await updateGenre({
      id: genre.id,
      loggedUserId: genre.userId,
      name: updatedGenre.name
    })

    expect(mockedPrisma.genres.findUnique).toHaveBeenCalledWith({
      where: { name: updatedGenre.name }
    })
    expect(mockedPrisma.genres.update).toHaveBeenCalledWith({
      data: { name: updatedGenre.name },
      where: { id: genre.id, userId: genre.userId }
    })
    expect(result).toEqual(updatedGenre)
  })

  it('rejects with a 500 HttpError and never updates when the genre name is already taken', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockedPrisma.genres.findUnique.mockResolvedValue(genre)

    await expect(
      updateGenre({ id: genre.id, loggedUserId: genre.userId, name: genre.name })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used'))
    expect(mockedPrisma.genres.update).not.toHaveBeenCalled()
  })

  it('wraps a rejection from genres.update into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockedPrisma.genres.findUnique.mockResolvedValue(null)
    mockedPrisma.genres.update.mockRejectedValue(new Error('record not found'))

    await expect(
      updateGenre({ id: genre.id, loggedUserId: genre.userId, name: genre.name })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'record not found'))
  })
})

describe('getGenreList', () => {
  it('resolves the genres owned by the logged user, mapping their movie count to moviesAmount', async () => {
    const genresWithCount = genreMocks.map(_genre => ({
      ..._genre,
      _count: { movies: 3 }
    }))
    mockedPrisma.genres.findMany.mockResolvedValue(genresWithCount)

    const result = await getGenreList(genreMocks[0].userId)

    expect(mockedPrisma.genres.findMany).toHaveBeenCalledWith({
      include: { _count: { select: { movies: true } } },
      where: { userId: genreMocks[0].userId }
    })
    expect(result).toEqual(genreMocks.map(_genre => ({ ..._genre, moviesAmount: 3 })))
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.genres.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(getGenreList(genreMocks[0].userId)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('deleteGenre', () => {
  it('deletes by id and resolves true, relying on ON DELETE CASCADE to clean up its movie relations', async () => {
    const [genre] = genreMocks
    mockedPrisma.genres.delete.mockResolvedValue(genre)

    const result = await deleteGenre(genre.id)

    expect(mockedPrisma.genres.delete).toHaveBeenCalledWith({ where: { id: genre.id } })
    expect(result).toBe(true)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockedPrisma.genres.delete.mockRejectedValue(new Error('foreign key constraint failed'))

    await expect(deleteGenre(genre.id)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'foreign key constraint failed')
    )
  })
})
