import { HttpError } from '@ts-types/api'
import { HTTP_STATUS } from '@ts/constants'
import { countryMocks } from '@ts/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { getCountryList } from '../countries'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('getCountryList', () => {
  it('resolves every registered country', async () => {
    mockedPrisma.countries.findMany.mockResolvedValue(countryMocks)

    const result = await getCountryList(null)

    expect(mockedPrisma.countries.findMany).toHaveBeenCalledWith()
    expect(result).toEqual(countryMocks)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.countries.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(getCountryList(null)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})
