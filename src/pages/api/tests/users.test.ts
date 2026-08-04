import type { APIContext } from 'astro'

import { createUser } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '../users'

vi.mock('@api/users', () => ({
  createUser: vi.fn<typeof createUser>()
}))

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

const mockedCreateUser = vi.mocked(createUser)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildContext = (formData: FormData): APIContext =>
  ({
    cookies: { delete: vi.fn(), get: vi.fn(), set: vi.fn() },
    request: new Request('http://localhost/api/users', { body: formData, method: 'POST' })
  }) as unknown as APIContext

const buildFormData = (overrides: Record<string, string> = {}) => {
  const [user] = userMocks
  const formData = new FormData()

  formData.append('name', overrides.name ?? user.name ?? '')
  formData.append('username', overrides.username ?? user.username)
  formData.append('email', overrides.email ?? user.email)
  formData.append('password', overrides.password ?? user.password)
  formData.append('repeatPassword', overrides.repeatPassword ?? user.password)

  return formData
}

describe('POST', () => {
  it('creates a user, generates an id, sets a refreshToken cookie, and returns 200', async () => {
    const [user] = userMocks
    const createdUser = { ...user, token: 'raw-token' }
    mockedCreateUser.mockResolvedValue(createdUser)
    const context = buildContext(buildFormData())

    const response = await POST(context)

    expect(mockedCreateUser).toHaveBeenCalledWith({
      email: user.email,
      id: 'fixed-test-id',
      name: user.name,
      password: user.password,
      username: user.username
    })
    expect(context.cookies.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'raw-token',
      expect.objectContaining({ httpOnly: true, path: '/' })
    )
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: createdUser })
  })

  it('returns 400 without calling createUser when a required field is missing', async () => {
    const formData = buildFormData({ email: '' })

    const response = await POST(buildContext(formData))

    expect(mockedCreateUser).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.MISSING_FIELDS })
  })

  it('returns 400 without calling createUser when the passwords do not match', async () => {
    const formData = buildFormData({ repeatPassword: 'somethingElse' })

    const response = await POST(buildContext(formData))

    expect(mockedCreateUser).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.PASSWORD_MISMATCH })
  })

  it('returns 400 with the joined Zod issue messages when the payload fails schema validation', async () => {
    const formData = buildFormData({ email: 'not-an-email' })

    const response = await POST(buildContext(formData))

    expect(mockedCreateUser).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Invalid email address']
    })
  })

  it('propagates the status and message carried by an HttpError from the data layer', async () => {
    mockedCreateUser.mockRejectedValue(
      new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    )

    const response = await POST(buildContext(buildFormData()))

    expect(response.status).toBe(HTTP_STATUS.CONFLICT)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.DUPLICATE_EMAIL })
  })

  it('masks unexpected errors behind a generic 500 message', async () => {
    mockedCreateUser.mockRejectedValue(new Error('connection refused'))

    const response = await POST(buildContext(buildFormData()))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.UNEXPECTED })
  })
})
