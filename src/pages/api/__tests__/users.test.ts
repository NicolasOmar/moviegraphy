import type { APIContext } from 'astro'

import { createUser } from '@api/users'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { userMocks } from '@ts/mocks'
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
    request: new Request('http://localhost/api/users', { body: formData, method: 'POST' })
  }) as APIContext

const buildFormData = (overrides: Record<string, string> = {}) => {
  const [user] = userMocks
  const formData = new FormData()

  formData.append('name', overrides.name ?? user.name)
  formData.append('email', overrides.email ?? user.email)
  formData.append('password', overrides.password ?? user.password)
  formData.append('repeatPassword', overrides.repeatPassword ?? user.password)

  return formData
}

describe('POST', () => {
  it('creates a user, generates an id, and returns 200 with the created record', async () => {
    const [user] = userMocks
    mockedCreateUser.mockResolvedValue(user)

    const response = await POST(buildContext(buildFormData()))

    expect(mockedCreateUser).toHaveBeenCalledWith({
      email: user.email,
      id: 'fixed-test-id',
      name: user.name,
      password: user.password
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: user })
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

  it('propagates the status and message carried by an HttpError from the data layer', async () => {
    mockedCreateUser.mockRejectedValue(
      new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    )

    const response = await POST(buildContext(buildFormData()))

    expect(response.status).toBe(HTTP_STATUS.CONFLICT)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.DUPLICATE_EMAIL })
  })

  it('masks unexpected errors behind a generic 500 message and logs the original error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedCreateUser.mockRejectedValue(new Error('connection refused'))

    const response = await POST(buildContext(buildFormData()))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.UNEXPECTED })
    expect(errorSpy).toHaveBeenCalledWith('[POST /api/users] connection refused')
  })
})
