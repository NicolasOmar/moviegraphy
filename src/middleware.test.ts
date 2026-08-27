import { isSessionValid } from '@api/sessions'
import { findUserBySession } from '@api/users'
import { type CustomAstroLocals } from '@ts-types/entities'
import {
  API_METHODS,
  API_URLS,
  HTTP_STATUS,
  PAGE_URL,
  SESSION_COOKIE_NAME,
  USER_ERROR_MESSAGES
} from '@ts/constants'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { onRequest } from './middleware'

vi.mock('@api/sessions', () => ({
  isSessionValid: vi.fn<typeof isSessionValid>()
}))

vi.mock('@api/users', () => ({
  findUserBySession: vi.fn<typeof findUserBySession>()
}))

const mockedIsSessionValid = vi.mocked(isSessionValid)
const mockedFindUserBySession = vi.mocked(findUserBySession)

beforeEach(() => {
  vi.clearAllMocks()
  mockedFindUserBySession.mockResolvedValue('9d3c1a2e-2222-4a1a-9a1a-000000000001')
})

type OnRequestContext = Parameters<typeof onRequest>[0]
type OnRequestNext = Parameters<typeof onRequest>[1]

const buildContext = (pathname: string, tokenValue?: string, method = 'GET') => {
  const cookies = {
    delete: vi.fn(),
    get: vi.fn().mockReturnValue(tokenValue ? { value: tokenValue } : undefined)
  }
  const redirect = vi.fn()
  const locals: Record<string, unknown> = {}

  return {
    context: {
      cookies,
      locals,
      redirect,
      request: new Request(`http://localhost${pathname}`, { method }),
      url: new URL(`http://localhost${pathname}`)
    } as unknown as OnRequestContext,
    next: vi.fn().mockResolvedValue(new Response()) as unknown as OnRequestNext
  }
}

describe('onRequest', () => {
  describe('API routes', () => {
    it('calls next without deleting the cookie when the login path is hit without a valid session', async () => {
      mockedIsSessionValid.mockResolvedValue(false)
      const { context, next } = buildContext(API_URLS.SESSIONS, undefined, API_METHODS.POST)

      await onRequest(context, next)

      expect(context.cookies.delete).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('calls next without deleting the cookie when the user-create path is hit without a valid session', async () => {
      mockedIsSessionValid.mockResolvedValue(false)
      const { context, next } = buildContext(API_URLS.USERS, undefined, API_METHODS.POST)

      await onRequest(context, next)

      expect(context.cookies.delete).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('returns 401, deletes the cookie, and skips next when a protected API route has no valid session', async () => {
      mockedIsSessionValid.mockResolvedValue(false)
      const { context, next } = buildContext(API_URLS.USERS, undefined, API_METHODS.PATCH)

      const response = (await onRequest(context, next)) as Response

      expect(context.cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.SESSION_EXPIRED })
      expect(next).not.toHaveBeenCalled()
    })

    it('calls next and stores the resolved loggedUserId in locals when a protected API route is hit with a valid session', async () => {
      mockedIsSessionValid.mockResolvedValue(true)
      const { context, next } = buildContext(API_URLS.USERS, 'raw-token', API_METHODS.PATCH)

      await onRequest(context, next)

      expect(mockedIsSessionValid).toHaveBeenCalledWith('raw-token')
      expect(mockedFindUserBySession).toHaveBeenCalledWith('raw-token')
      expect((context.locals as CustomAstroLocals).loggedUserId).toBe(
        '9d3c1a2e-2222-4a1a-9a1a-000000000001'
      )
      expect(context.cookies.delete).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('treats a rejected isSessionValid as an invalid session and returns 401', async () => {
      mockedIsSessionValid.mockRejectedValue(new Error('connection refused'))
      const { context, next } = buildContext(API_URLS.USERS, 'raw-token', API_METHODS.PATCH)

      const response = (await onRequest(context, next)) as Response

      expect(context.cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('page routes', () => {
    it('redirects to login and deletes the cookie when there is no valid session and the page is not auth-exempt', async () => {
      mockedIsSessionValid.mockResolvedValue(false)
      const { context, next } = buildContext('/movies', 'raw-token')

      await onRequest(context, next)

      expect(context.cookies.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
      expect(context.cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
      expect(context.redirect).toHaveBeenCalledWith(PAGE_URL.LOGIN)
      expect(next).not.toHaveBeenCalled()
    })

    it('treats a missing session cookie as an invalid session and redirects to login', async () => {
      mockedIsSessionValid.mockResolvedValue(false)
      const { context, next } = buildContext('/movies')

      await onRequest(context, next)

      expect(mockedIsSessionValid).toHaveBeenCalledWith(undefined)
      expect(context.redirect).toHaveBeenCalledWith(PAGE_URL.LOGIN)
      expect(next).not.toHaveBeenCalled()
    })

    it('calls next when there is no valid session but the page is auth-exempt', async () => {
      mockedIsSessionValid.mockResolvedValue(false)
      const { context, next } = buildContext(PAGE_URL.LOGIN)

      await onRequest(context, next)

      expect(context.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('redirects to home when there is a valid session and the page is auth-exempt', async () => {
      mockedIsSessionValid.mockResolvedValue(true)
      const { context, next } = buildContext(PAGE_URL.USERS_CREATE, 'raw-token')

      await onRequest(context, next)

      expect(mockedIsSessionValid).toHaveBeenCalledWith('raw-token')
      expect(context.redirect).toHaveBeenCalledWith(PAGE_URL.HOME)
      expect(next).not.toHaveBeenCalled()
    })

    it('calls next and stores the resolved loggedUserId in locals when there is a valid session and the page is not auth-exempt', async () => {
      mockedIsSessionValid.mockResolvedValue(true)
      const { context, next } = buildContext('/movies', 'raw-token')

      await onRequest(context, next)

      expect(mockedFindUserBySession).toHaveBeenCalledWith('raw-token')
      expect((context.locals as CustomAstroLocals).loggedUserId).toBe(
        '9d3c1a2e-2222-4a1a-9a1a-000000000001'
      )
      expect(context.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
