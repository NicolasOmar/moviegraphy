import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { userMocks } from '@ts/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { Prisma } from '../../prisma/generated/client'
import prisma from './prisma'
import { createUser } from './users'

vi.mock('./prisma')

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('createUser', () => {
  it('creates a user forwarding the given entity as data and returns the created record', async () => {
    const [user] = userMocks
    mockedPrisma.user.create.mockResolvedValue(user)

    const result = await createUser(user)

    expect(mockedPrisma.user.create).toHaveBeenCalledWith({ data: user })
    expect(result).toEqual(user)
  })

  it('translates a unique constraint violation on email into a 409 HttpError', async () => {
    const [user] = userMocks
    mockedPrisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          clientVersion: '7.0.0',
          code: 'P2002',
          meta: { target: ['email'] }
        }
      )
    )

    await expect(createUser(user)).rejects.toEqual(
      new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    )
  })

  it('rethrows any other error unchanged', async () => {
    const [user] = userMocks
    const unexpectedError = new Error('connection refused')
    mockedPrisma.user.create.mockRejectedValue(unexpectedError)

    await expect(createUser(user)).rejects.toThrow(unexpectedError)
  })
})
