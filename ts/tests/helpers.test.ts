import { HTTP_STATUS, PAGE_URL } from '@ts/constants'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  arePassworsEqual,
  fetchWithAuth,
  getCurrentISODate,
  getISODateWithDaysOffset,
  parseToIsoDate
} from '../helpers'

describe('fetchWithAuth', () => {
  const mockedAssign = vi.fn()
  const mockedFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockedFetch)
    vi.stubGlobal('window', { location: { assign: mockedAssign } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockedAssign.mockClear()
    mockedFetch.mockClear()
  })

  it('returns the response as-is without navigating when the request succeeds', async () => {
    const okResponse = new Response(null, { status: HTTP_STATUS.OK })
    mockedFetch.mockResolvedValue(okResponse)

    const response = await fetchWithAuth('/api/movies')

    expect(response).toBe(okResponse)
    expect(mockedAssign).not.toHaveBeenCalled()
  })

  it('navigates to the login page while still returning the response when the session is unauthorized', async () => {
    const unauthorizedResponse = new Response(null, { status: HTTP_STATUS.UNAUTHORIZED })
    mockedFetch.mockResolvedValue(unauthorizedResponse)

    const response = await fetchWithAuth('/api/movies')

    expect(response).toBe(unauthorizedResponse)
    expect(mockedAssign).toHaveBeenCalledWith(PAGE_URL.LOGIN)
  })
})

describe('arePassworsEqual', () => {
  it('returns true or false based on a strict match between two provided passwords', () => {
    expect(arePassworsEqual('secret123', 'secret123')).toBe(true)
    expect(arePassworsEqual('secret123', 'different456')).toBe(false)
  })

  it('returns true when either password is missing, since there is nothing to compare yet', () => {
    expect(arePassworsEqual(undefined, 'secret123')).toBe(true)
    expect(arePassworsEqual('secret123', undefined)).toBe(true)
    expect(arePassworsEqual(undefined, undefined)).toBe(true)
  })
})

describe('getCurrentISODate', () => {
  it('returns a Date matching the current UTC moment, rebuilt through an ISO round-trip', () => {
    const before = Date.now()

    const result = getCurrentISODate()

    const after = Date.now()
    expect(result.getTime()).toBeGreaterThanOrEqual(before)
    expect(result.getTime()).toBeLessThanOrEqual(after)
    expect(result.toISOString()).toBe(new Date(result.getTime()).toISOString())
  })
})

describe('getISODateWithDaysOffset', () => {
  it('returns a Date offset forward by a positive number of days', () => {
    const now = Date.now()

    const result = getISODateWithDaysOffset(7)

    expect(result.getTime()).toBeGreaterThanOrEqual(now + 7 * 24 * 60 * 60 * 1000 - 1000)
    expect(result.getTime()).toBeLessThanOrEqual(now + 7 * 24 * 60 * 60 * 1000 + 1000)
  })

  it('returns a Date offset backward when given a negative number of days', () => {
    const now = Date.now()

    const result = getISODateWithDaysOffset(-1)

    expect(result.getTime()).toBeLessThan(now)
  })
})

describe('parseToIsoDate', () => {
  it('rebuilds a Date instance through an ISO round-trip', () => {
    const original = new Date('2024-01-15T10:30:00.000Z')

    const result = parseToIsoDate(original)

    expect(result.toISOString()).toBe(original.toISOString())
  })

  it('parses a date string into a Date matching its ISO representation', () => {
    const result = parseToIsoDate('2024-01-15')

    expect(result.toISOString()).toBe(new Date('2024-01-15').toISOString())
  })

  it('parses a timestamp number into a Date matching its ISO representation', () => {
    const timestamp = 1705315800000

    const result = parseToIsoDate(timestamp)

    expect(result.toISOString()).toBe(new Date(timestamp).toISOString())
  })
})
