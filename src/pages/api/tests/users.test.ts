import type { APIContext } from 'astro'

import { isSessionValid } from '@api/sessions'
import { createUser, findUserBySession, findUserByUsername, updateUser } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH, POST } from '../users'

vi.mock('@api/users', () => ({
  createUser: vi.fn<typeof createUser>(),
  findUserBySession: vi.fn<typeof findUserBySession>(),
  findUserByUsername: vi.fn<typeof findUserByUsername>(),
  updateUser: vi.fn<typeof updateUser>()
}))

vi.mock('@api/sessions', () => ({
  isSessionValid: vi.fn<typeof isSessionValid>()
}))

vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

const mockedCreateUser = vi.mocked(createUser)
const mockedFindUserBySession = vi.mocked(findUserBySession)
const mockedFindUserByUsername = vi.mocked(findUserByUsername)
const mockedUpdateUser = vi.mocked(updateUser)
const mockedIsSessionValid = vi.mocked(isSessionValid)

beforeEach(() => {
  vi.clearAllMocks()
  mockedIsSessionValid.mockResolvedValue(true)
})

const buildContext = (formData: FormData, method = 'POST'): APIContext =>
  ({
    cookies: {
      delete: vi.fn(),
      get: vi.fn().mockReturnValue({ value: 'raw-token' }),
      set: vi.fn()
    },
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
    const createdUser = { ...user, sessionToken: 'raw-token' }
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

describe('PATCH', () => {
  it('returns 400 without calling findUserByUsername when the session token is invalid', async () => {
    mockedIsSessionValid.mockResolvedValue(false)
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(mockedFindUserByUsername).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: 'No token provided' })
  })

  it('returns 400 with the joined Zod issue messages when the username fails schema validation', async () => {
    const context = buildContext(buildPatchFormData({ username: 'a'.repeat(51) }), 'PATCH')

    const response = await PATCH(context)

    expect(mockedFindUserByUsername).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too big: expected string to have <=50 characters']
    })
  })

  it('returns 400 without calling findUserBySession when the username is already taken', async () => {
    const [user] = userMocks
    mockedFindUserByUsername.mockResolvedValue(true)
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(mockedFindUserBySession).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: `Username '${user.username}' is already taken`
    })
  })

  it("returns 400 without calling updateUser when the session's owning user can't be found", async () => {
    mockedFindUserByUsername.mockResolvedValue(false)
    mockedFindUserBySession.mockResolvedValue('')
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(mockedUpdateUser).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: 'NO PATCH USER' })
  })

  it('updates the user for the session owner and returns 200 when the payload is valid', async () => {
    const [user] = userMocks
    mockedFindUserByUsername.mockResolvedValue(false)
    mockedFindUserBySession.mockResolvedValue(user.id)
    mockedUpdateUser.mockResolvedValue(true)
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(mockedFindUserBySession).toHaveBeenCalledWith('raw-token')
    expect(mockedUpdateUser).toHaveBeenCalledWith({
      id: user.id,
      name: user.name,
      username: user.username
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: true })
  })

  it('propagates the status and message carried by an HttpError from the data layer', async () => {
    mockedFindUserByUsername.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
    const context = buildContext(buildPatchFormData(), 'PATCH')

    const response = await PATCH(context)

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'connection refused' })
  })
})
