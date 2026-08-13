import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { genreMocks } from '../../../ts/mocks'
import prisma from '../../prisma'
import { createGenre, findGenres } from '../genres'

vi.mock('../../prisma', () => import('../mocks/prisma'))
vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

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

describe('createGenre', () => {
  it('creates a genre for the session owner once the name is free, generating a new id', async () => {
    const [genre] = genreMocks
    mockSessionFor(genre.userId)
    mockedPrisma.genres.findUnique.mockResolvedValue(null)
    mockedPrisma.genres.create.mockResolvedValue(genre)

    const result = await createGenre({ id: genre.id, name: genre.name, sessionToken: 'raw-token' })

    expect(mockedPrisma.genres.findUnique).toHaveBeenCalledWith({ where: { name: genre.name } })
    expect(mockedPrisma.genres.create).toHaveBeenCalledWith({
      data: { id: 'fixed-test-id', name: genre.name, userId: genre.userId }
    })
    expect(result).toEqual(genre)
  })

  it('rejects with a 400 HttpError and never queries genres when the session token is unknown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(
      createGenre({ id: 'irrelevant-id', name: 'Horror', sessionToken: 'bad-token' })
    ).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.genres.findUnique).not.toHaveBeenCalled()
    expect(mockedPrisma.genres.create).not.toHaveBeenCalled()
  })

  it('rejects with a 400 HttpError when the resolved session user id is falsy', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockSessionFor('')

    await expect(
      createGenre({ id: 'irrelevant-id', name: 'Horror', sessionToken: 'raw-token' })
    ).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.genres.findUnique).not.toHaveBeenCalled()
  })

  it('rejects with a 500 HttpError and never creates when the genre name is already taken', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockSessionFor(genre.userId)
    mockedPrisma.genres.findUnique.mockResolvedValue(genre)

    await expect(
      createGenre({ id: genre.id, name: genre.name, sessionToken: 'raw-token' })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used'))
    expect(mockedPrisma.genres.create).not.toHaveBeenCalled()
  })

  it('wraps a rejection from genres.create into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockSessionFor(genre.userId)
    mockedPrisma.genres.findUnique.mockResolvedValue(null)
    mockedPrisma.genres.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(
      createGenre({ id: genre.id, name: genre.name, sessionToken: 'raw-token' })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed'))
  })

  it('wraps a non-Error rejection from genres.findUnique into a 500 HttpError with the stringified value', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [genre] = genreMocks
    mockSessionFor(genre.userId)
    mockedPrisma.genres.findUnique.mockRejectedValue('connection refused')

    await expect(
      createGenre({ id: genre.id, name: genre.name, sessionToken: 'raw-token' })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused'))
  })
})

describe('findGenres', () => {
  it('resolves the genres owned by the session user', async () => {
    mockSessionFor(genreMocks[0].userId)
    mockedPrisma.genres.findMany.mockResolvedValue(genreMocks)

    const result = await findGenres('raw-token')

    expect(mockedPrisma.genres.findMany).toHaveBeenCalledWith({
      where: { userId: genreMocks[0].userId }
    })
    expect(result).toEqual(genreMocks)
  })

  it('rejects with a 400 HttpError and never queries genres when the session token is unknown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(findGenres('bad-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.genres.findMany).not.toHaveBeenCalled()
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockSessionFor(genreMocks[0].userId)
    mockedPrisma.genres.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(findGenres('raw-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})
