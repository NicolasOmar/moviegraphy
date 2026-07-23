import { userMocks } from '@ts/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../prisma'
import { createUser } from '../users'

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
})
