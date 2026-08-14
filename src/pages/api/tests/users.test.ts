import type { APIContext } from 'astro'

import { createUser, updateUser } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH, POST } from '../users'

vi.mock('@api/users', () => ({
  createUser: vi.fn<typeof createUser>(),
  updateUser: vi.fn<typeof updateUser>()
}))

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

const mockedCreateUser = vi.mocked(createUser)
const mockedUpdateUser = vi.mocked(updateUser)

beforeEach(() => {
  vi.clearAllMocks()
})

const loggedUserId = userMocks[0].id

const buildContext = (formData: FormData, method = 'POST'): APIContext =>
  ({
    cookies: {
      delete: vi.fn(),
      get: vi.fn().mockReturnValue({ value: 'raw-token' }),
      set: vi.fn()
    },
    locals: { loggedUserId },
    request: new Request('http://localhost/api/users', { body: formData, method })
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

const buildPatchFormData = (overrides: Record<string, string> = {}) => {
  const [user] = userMocks
  const formData = new FormData()

  formData.append('name', overrides.name ?? user.name ?? '')
  formData.append('username', overrides.username ?? user.username)

  return formData
}

describe('POST', () => {
  it('creates a user, generates an id, sets a refreshToken cookie, and returns 200', async () => {
    const [user] = userMocks
    mockedCreateUser.mockResolvedValue('raw-token')
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
    expect(await response.json()).toEqual({ message: 'raw-token' })
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

describe('PATCH', () => {
  it('returns 400 with the joined Zod issue messages when the username fails schema validation', async () => {
    const context = buildContext(buildPatchFormData({ username: 'a'.repeat(51) }), 'PATCH')

    const response = await PATCH(context)

    expect(mockedUpdateUser).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too big: expected string to have <=50 characters']
    })
  })

  it('updates the logged user and returns 200 when the payload is valid', async () => {
    const [user] = userMocks
    mockedUpdateUser.mockResolvedValue(true)
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(mockedUpdateUser).toHaveBeenCalledWith({
      loggedUserId,
      name: user.name,
      username: user.username
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: true })
  })

  it('returns 400 with the data layer message when the username is already taken', async () => {
    const [user] = userMocks
    mockedUpdateUser.mockRejectedValue(
      new HttpError(HTTP_STATUS.BAD_REQUEST, `Username '${user.username}' is already taken`)
    )
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: `Username '${user.username}' is already taken`
    })
  })

  it('propagates the status and message carried by an HttpError from the data layer', async () => {
    mockedUpdateUser.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'connection refused' })
  })
})
