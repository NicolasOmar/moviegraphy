import { isSessionValid } from '@api/sessions'
import { PAGE_URL, SESSION_COOKIE_NAME } from '@ts/constants'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { onRequest } from './middleware'

vi.mock('@api/sessions', () => ({
  isSessionValid: vi.fn<typeof isSessionValid>()
}))

const mockedIsSessionValid = vi.mocked(isSessionValid)

beforeEach(() => {
  vi.clearAllMocks()
})

type OnRequestContext = Parameters<typeof onRequest>[0]
type OnRequestNext = Parameters<typeof onRequest>[1]

const buildContext = (pathname: string, tokenValue?: string) => {
  const cookies = { get: vi.fn().mockReturnValue(tokenValue ? { value: tokenValue } : undefined) }
  const redirect = vi.fn()

  return {
    context: {
      cookies,
      redirect,
      url: new URL(`http://localhost${pathname}`)
    } as unknown as OnRequestContext,
    next: vi.fn().mockResolvedValue(new Response()) as unknown as OnRequestNext
  }
}

describe('onRequest', () => {
  it('calls next without checking the session when the request targets an API route', async () => {
    const { context, next } = buildContext('/api/sessions')

    await onRequest(context, next)

    expect(mockedIsSessionValid).not.toHaveBeenCalled()
    expect(context.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('redirects to login when there is no valid session and the page is not auth-exempt', async () => {
    mockedIsSessionValid.mockResolvedValue(false)
    const { context, next } = buildContext('/movies')

    await onRequest(context, next)

    expect(context.cookies.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
    expect(context.redirect).toHaveBeenCalledWith(PAGE_URL.LOGIN)
    expect(next).not.toHaveBeenCalled()
  })

  it('treats a missing session cookie as an invalid session without calling isSessionValid', async () => {
    const { context, next } = buildContext('/movies')

    await onRequest(context, next)

    expect(mockedIsSessionValid).not.toHaveBeenCalled()
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

  it('calls next when there is a valid session and the page is not auth-exempt', async () => {
    mockedIsSessionValid.mockResolvedValue(true)
    const { context, next } = buildContext('/movies', 'raw-token')

    await onRequest(context, next)

    expect(context.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
