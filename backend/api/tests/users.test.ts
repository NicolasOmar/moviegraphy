import { HttpError } from '@ts-types/api'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { sessionMocks, userMocks } from '@ts/mocks'
import { compareHashed, hashString } from '@ts/tokens'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { Prisma } from '../../prisma/generated/client'
import {
  createUser,
  findUserBySession,
  findUserByUsername,
  updatePassword,
  updateUser
} from '../users'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
  vi.stubEnv('JWT_SECRET', 'test-jwt-secret')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('createUser', () => {
  it('creates a user, persists a hashed refresh token for it, and returns the email with a raw token', async () => {
    const [user] = userMocks
    mockedPrisma.users.create.mockResolvedValue(user)

    const result = await createUser(user)

    expect(mockedPrisma.users.create).toHaveBeenCalledWith({
      data: { ...user, password: expect.any(String) }
    })

    const [[{ data: createdUserData }]] = mockedPrisma.users.create.mock.calls
    expect(createdUserData.password).not.toBe(user.password)
    await expect(compareHashed(user.password, createdUserData.password)).resolves.toBe(true)

    expect(mockedPrisma.sessions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        expiresAt: expect.any(Date),
        token: expect.any(String),
        userId: user.id
      })
    })
    expect(result).toEqual(expect.any(String))
  })

  it('translates a P2002 unique-constraint error into a 409 duplicate-email HttpError', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    mockedPrisma.users.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          clientVersion: 'test',
          code: 'P2002'
        }
      )
    )

    await expect(createUser(user)).rejects.toEqual(
      new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    )
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    mockedPrisma.users.create.mockRejectedValue(new Error('connection refused'))

    await expect(createUser(user)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('updatePassword', () => {
  const buildPasswords = (overrides: Partial<Parameters<typeof updatePassword>[0]> = {}) => ({
    loggedUserId: userMocks[0].id,
    newPassword: 'brandNewPassword123',
    oldPassword: userMocks[0].password,
    ...overrides
  })

  it('hashes and persists the new password when the logged user and old password are valid', async () => {
    const [user] = userMocks
    const hashedOldPassword = await hashString(user.password)
    mockedPrisma.users.findUnique.mockResolvedValue({ ...user, password: hashedOldPassword })

    const result = await updatePassword(buildPasswords())

    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({ where: { id: user.id } })
    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      data: { password: expect.any(String) },
      where: { id: user.id }
    })

    const [[{ data: updatedData }]] = mockedPrisma.users.update.mock.calls
    expect(typeof updatedData.password).toBe('string')
    await expect(
      compareHashed('brandNewPassword123', updatedData.password as string)
    ).resolves.toBe(true)
    expect(result).toBe(true)
  })

  it('rejects with a 400 invalid-credentials HttpError when no user matches the loggedUserId', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.users.findUnique.mockResolvedValue(null)

    await expect(updatePassword(buildPasswords())).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.users.update).not.toHaveBeenCalled()
  })

  it('rejects with a 400 invalid-credentials HttpError when the old password does not match', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    const hashedOldPassword = await hashString(user.password)
    mockedPrisma.users.findUnique.mockResolvedValue({ ...user, password: hashedOldPassword })

    await expect(updatePassword(buildPasswords({ oldPassword: 'wrong-password' }))).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.PASSWORD_MISMATCH)
    )
    expect(mockedPrisma.users.update).not.toHaveBeenCalled()
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.users.findUnique.mockRejectedValue(new Error('connection refused'))

    await expect(updatePassword(buildPasswords())).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('updateUser', () => {
  it('persists a null name as-is, and resolves true', async () => {
    const [user] = userMocks
    mockedPrisma.users.findUnique.mockResolvedValue(null)
    mockedPrisma.users.update.mockResolvedValue(user)

    const result = await updateUser({
      loggedUserId: user.id,
      name: null,
      username: 'newUsername'
    })

    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      data: { name: null, username: 'newUsername' },
      where: { id: user.id }
    })
    expect(result).toBe(true)
  })

  it('persists a provided name unchanged', async () => {
    const [user] = userMocks
    mockedPrisma.users.findUnique.mockResolvedValue(null)
    mockedPrisma.users.update.mockResolvedValue(user)

    await updateUser({ loggedUserId: user.id, name: 'New Name', username: 'newUsername' })

    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      data: { name: 'New Name', username: 'newUsername' },
      where: { id: user.id }
    })
  })

  it('rejects with a 400 HttpError and never updates when the new username is already taken', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user, otherUser] = userMocks
    mockedPrisma.users.findUnique.mockResolvedValue(otherUser)

    await expect(
      updateUser({ loggedUserId: user.id, name: user.name, username: otherUser.username })
    ).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, `Username '${otherUser.username}' is already taken`)
    )
    expect(mockedPrisma.users.update).not.toHaveBeenCalled()
  })

  it('wraps any rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    mockedPrisma.users.findUnique.mockResolvedValue(null)
    mockedPrisma.users.update.mockRejectedValue(new Error('connection refused'))

    await expect(
      updateUser({ loggedUserId: user.id, name: user.name, username: user.username })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused'))
  })

  it('rethrows an HttpError from the data layer as-is instead of wrapping it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    const originalError = new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    mockedPrisma.users.findUnique.mockResolvedValue(null)
    mockedPrisma.users.update.mockRejectedValue(originalError)

    await expect(
      updateUser({ loggedUserId: user.id, name: user.name, username: user.username })
    ).rejects.toBe(originalError)
  })
})

describe('findUserByUsername', () => {
  it('resolves true when a user with the given username exists, and false when none matches', async () => {
    const [user] = userMocks
    mockedPrisma.users.findUnique.mockResolvedValue(user)

    await expect(findUserByUsername({ username: user.username })).resolves.toBe(true)
    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { username: user.username }
    })

    mockedPrisma.users.findUnique.mockResolvedValue(null)

    await expect(findUserByUsername({ username: 'ghost' })).resolves.toBe(false)
  })

  it('wraps any rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.users.findUnique.mockRejectedValue(new Error('connection refused'))

    await expect(findUserByUsername({ username: 'neo' })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })

  it('rethrows an HttpError from the data layer as-is instead of wrapping it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const originalError = new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      USER_ERROR_MESSAGES.INVALID_CREDENTIALS
    )
    mockedPrisma.users.findUnique.mockRejectedValue(originalError)

    await expect(findUserByUsername({ username: 'neo' })).rejects.toBe(originalError)
  })
})

describe('findUserBySession', () => {
  it('returns the owning userId for a session matching the hashed token', async () => {
    const [session] = sessionMocks
    mockedPrisma.sessions.findFirst.mockResolvedValue(session)

    const result = await findUserBySession('some-raw-token')

    expect(mockedPrisma.sessions.findFirst).toHaveBeenCalledWith({
      where: { token: expect.any(String) }
    })
    expect(result).toBe(session.userId)
  })

  it('rejects with a 400 invalid-credentials HttpError when no session matches the token', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(findUserBySession('bad-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockRejectedValue(new Error('connection refused'))

    await expect(findUserBySession('some-raw-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})
