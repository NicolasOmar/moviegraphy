import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { Prisma } from '../../prisma/generated/client'
import { createUser } from '../users'

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

    expect(mockedPrisma.users.create).toHaveBeenCalledWith({ data: user })
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
