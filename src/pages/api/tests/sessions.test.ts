import type { APIContext } from 'astro'

import { loginUser, logoutUser } from '@api/sessions'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE, POST } from '../sessions'

vi.mock('@api/sessions', () => ({
  loginUser: vi.fn<typeof loginUser>(),
  logoutUser: vi.fn<typeof logoutUser>()
}))

const mockedLoginUser = vi.mocked(loginUser)
const mockedLogoutUser = vi.mocked(logoutUser)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildFormData = (overrides: Record<string, string> = {}) => {
  const [user] = userMocks
  const formData = new FormData()

  formData.append('name', overrides.name ?? user.name)
  formData.append('password', overrides.password ?? user.password)

  return formData
}

const buildContext = (
  { cookies }: { cookies?: Partial<APIContext['cookies']> } = {},
  formData?: FormData
): APIContext =>
  ({
    cookies: { delete: vi.fn(), get: vi.fn(), set: vi.fn(), ...cookies },
    request: new Request('http://localhost/api/sessions', {
      body: formData ?? buildFormData(),
      method: 'POST'
    })
  }) as unknown as APIContext

describe('POST', () => {
  it('logs a user in, sets a refreshToken cookie, and returns 200', async () => {
    const [user] = userMocks
    mockedLoginUser.mockResolvedValue({ email: user.email, sessionToken: 'raw-token' })
    const context = buildContext()

    const response = await POST(context)

    expect(mockedLoginUser).toHaveBeenCalledWith({ name: user.name, password: user.password })
    expect(context.cookies.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'raw-token',
      expect.objectContaining({ httpOnly: true, path: '/' })
    )
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: { success: true } })
  })

  it('propagates the status and message carried by an HttpError when credentials are invalid', async () => {
    mockedLoginUser.mockRejectedValue(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    const context = buildContext()

    const response = await POST(context)

    expect(context.cookies.set).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.INVALID_CREDENTIALS })
  })
})

describe('DELETE', () => {
  it('logs the user out and clears the refreshToken cookie when one is present', async () => {
    const context = buildContext({
      cookies: { get: vi.fn().mockReturnValue({ value: 'raw-token' }) }
    })

    const response = await DELETE(context)

    expect(mockedLogoutUser).toHaveBeenCalledWith('raw-token')
    expect(context.cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: { success: true } })
  })

  it('returns 400 without calling logoutUser when no refreshToken cookie is present', async () => {
    const context = buildContext({ cookies: { get: vi.fn().mockReturnValue(undefined) } })

    const response = await DELETE(context)

    expect(mockedLogoutUser).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: 'No token provided' })
  })

  it('propagates the status and message carried by an HttpError when logoutUser rejects', async () => {
    mockedLogoutUser.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'session lookup failed')
    )
    const context = buildContext({
      cookies: { get: vi.fn().mockReturnValue({ value: 'raw-token' }) }
    })

    const response = await DELETE(context)

    expect(context.cookies.delete).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'session lookup failed' })
  })
})
