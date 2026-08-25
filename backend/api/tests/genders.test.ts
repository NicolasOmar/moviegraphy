import { HTTP_STATUS } from '@ts/constants'
import { genderMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { getGenderList } from '../genders'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('getGenderList', () => {
  it('resolves every registered gender', async () => {
    mockedPrisma.genders.findMany.mockResolvedValue(genderMocks)

    const result = await getGenderList(null)

    expect(mockedPrisma.genders.findMany).toHaveBeenCalledWith()
    expect(result).toEqual(genderMocks)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.genders.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(getGenderList(null)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})
