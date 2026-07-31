import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { compareHashed, hashString } from '@ts/helpers'
import { sessionMocks, userMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { Prisma } from '../../prisma/generated/client'
import { createUser, updatePassword } from '../users'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
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
    expect(result).toEqual({ email: user.email, token: expect.any(String) })
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
    newPassword: 'brandNewPassword123',
    oldPassword: userMocks[0].password,
    sessionToken: 'some-raw-token',
    ...overrides
  })

  it('hashes and persists the new password when the session and old password are valid', async () => {
    const [user] = userMocks
    const [session] = sessionMocks
    const hashedOldPassword = await hashString(user.password)
    mockedPrisma.sessions.findFirst.mockResolvedValue(session)
    mockedPrisma.users.findUnique.mockResolvedValue({ ...user, password: hashedOldPassword })

    const result = await updatePassword(buildPasswords())

    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({ where: { id: session.userId } })
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

  it('rejects with a 400 invalid-credentials HttpError when no session matches the token', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    await expect(updatePassword(buildPasswords())).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.users.update).not.toHaveBeenCalled()
  })

  it('rejects with a 400 invalid-credentials HttpError when the session has no matching user', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [session] = sessionMocks
    mockedPrisma.sessions.findFirst.mockResolvedValue(session)
    mockedPrisma.users.findUnique.mockResolvedValue(null)

    await expect(updatePassword(buildPasswords())).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.users.update).not.toHaveBeenCalled()
  })

  it('rejects with a 400 invalid-credentials HttpError when the old password does not match', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    const [session] = sessionMocks
    const hashedOldPassword = await hashString(user.password)
    mockedPrisma.sessions.findFirst.mockResolvedValue(session)
    mockedPrisma.users.findUnique.mockResolvedValue({ ...user, password: hashedOldPassword })

    await expect(updatePassword(buildPasswords({ oldPassword: 'wrong-password' }))).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.users.update).not.toHaveBeenCalled()
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockRejectedValue(new Error('connection refused'))

    await expect(updatePassword(buildPasswords())).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})
