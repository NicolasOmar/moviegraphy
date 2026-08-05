import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { sessionMocks, userMocks } from '@ts/mocks'
import { hashString } from '@ts/tokens'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { isSessionValid, loginUser, logoutUser } from '../sessions'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('isSessionValid', () => {
  it('returns false without querying the database when no token is given', async () => {
    expect(await isSessionValid(undefined)).toBe(false)
    expect(await isSessionValid(null)).toBe(false)
    expect(mockedPrisma.sessions.findFirst).not.toHaveBeenCalled()
  })

  it('returns true when a non-expired session matches the given raw token', async () => {
    const [session] = sessionMocks
    mockedPrisma.sessions.findFirst.mockResolvedValue(session)

    const result = await isSessionValid('some-raw-token')

    expect(mockedPrisma.sessions.findFirst).toHaveBeenCalledWith({
      where: { expiresAt: { gt: expect.any(Date) }, token: expect.any(String) }
    })
    expect(result).toBe(true)
  })

  it('returns false when no session matches the given token', async () => {
    mockedPrisma.sessions.findFirst.mockResolvedValue(null)

    expect(await isSessionValid('some-raw-token')).toBe(false)
  })

  it('returns false and logs the failure when the query rejects', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.findFirst.mockRejectedValue(new Error('connection refused'))

    const result = await isSessionValid('some-raw-token')

    expect(result).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith('[middleware] refresh token validation failed', {
      errorMessage: 'connection refused'
    })
  })
})

describe('loginUser', () => {
  it('returns the email and a raw token, persisting a hashed session for the matched user', async () => {
    const [user] = userMocks
    const hashedPassword = await hashString(user.password)
    mockedPrisma.users.findFirst.mockResolvedValue({ ...user, password: hashedPassword })

    const result = await loginUser({ password: user.password, username: user.username })

    expect(mockedPrisma.users.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ username: user.username }, { email: user.username }] }
    })
    expect(mockedPrisma.sessions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        expiresAt: expect.any(Date),
        token: expect.any(String),
        userId: user.id
      })
    })
    expect(result).toEqual({ email: user.email, sessionToken: expect.any(String) })
  })

  it('rejects with a 400 invalid-credentials HttpError when no user matches', async () => {
    mockedPrisma.users.findFirst.mockResolvedValue(null)

    await expect(loginUser({ password: 'whatever', username: 'ghost' })).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.sessions.create).not.toHaveBeenCalled()
  })

  it('rejects with a 400 invalid-credentials HttpError when the password does not match', async () => {
    const [user] = userMocks
    const hashedPassword = await hashString(user.password)
    mockedPrisma.users.findFirst.mockResolvedValue({ ...user, password: hashedPassword })

    await expect(
      loginUser({ password: 'wrong-password', username: user.username })
    ).rejects.toEqual(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    expect(mockedPrisma.sessions.create).not.toHaveBeenCalled()
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [user] = userMocks
    mockedPrisma.users.findFirst.mockRejectedValue(new Error('connection refused'))

    await expect(loginUser({ password: user.password, username: user.username })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('logoutUser', () => {
  it('deletes the session matching the hashed token and resolves true', async () => {
    const result = await logoutUser('some-raw-token')

    expect(mockedPrisma.sessions.delete).toHaveBeenCalledWith({
      where: { token: expect.any(String) }
    })
    expect(result).toBe(true)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.sessions.delete.mockRejectedValue(new Error('record not found'))

    await expect(logoutUser('some-raw-token')).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'record not found')
    )
  })
})
