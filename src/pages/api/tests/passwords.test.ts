import type { APIContext } from 'astro'

import { updatePassword } from '@api/users'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '../passwords'

vi.mock('@api/users', () => ({
  updatePassword: vi.fn<typeof updatePassword>()
}))

const mockedUpdatePassword = vi.mocked(updatePassword)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildFormData = (overrides: Record<string, string | undefined> = {}) => {
  const formData = new FormData()
  const defaults = {
    new: 'brandNewPassword123',
    old: 'currentPassword123',
    repeatNew: 'brandNewPassword123'
  }
  const fields = { ...defaults, ...overrides }

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value)
    }
  })

  return formData
}

const buildContext = (formData?: FormData): APIContext =>
  ({
    cookies: { get: vi.fn().mockReturnValue({ value: 'raw-token' }) },
    request: new Request('http://localhost/api/passwords', {
      body: formData ?? buildFormData(),
      method: 'POST'
    })
  }) as unknown as APIContext

describe('POST', () => {
  it('returns 400 without calling updatePassword when the new password matches the old one', async () => {
    const context = buildContext(
      buildFormData({ new: 'samePassword', old: 'samePassword', repeatNew: 'samePassword' })
    )

    const response = await POST(context)

    expect(mockedUpdatePassword).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: 'Passwords are not the same' })
  })

  it('returns 400 without calling updatePassword when the repeated password does not match', async () => {
    const context = buildContext(buildFormData({ repeatNew: 'somethingElse' }))

    const response = await POST(context)

    expect(mockedUpdatePassword).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: 'Passwords are not the same' })
  })

  it('returns 400 with the joined Zod issue messages when a required field is missing', async () => {
    const context = buildContext(buildFormData({ old: undefined }))

    const response = await POST(context)

    expect(mockedUpdatePassword).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    const { message } = (await response.json()) as { message: string[] }
    expect(message).toHaveLength(1)
  })

  it('updates the password and returns 200 when the payload is valid', async () => {
    mockedUpdatePassword.mockResolvedValue(true)
    const context = buildContext()

    const response = await POST(context)

    expect(mockedUpdatePassword).toHaveBeenCalledWith({
      newPassword: 'brandNewPassword123',
      oldPassword: 'currentPassword123',
      sessionToken: 'raw-token'
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: true })
  })

  it('propagates the status and message carried by an HttpError from the data layer', async () => {
    mockedUpdatePassword.mockRejectedValue(
      new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    )
    const context = buildContext()

    const response = await POST(context)

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.INVALID_CREDENTIALS })
  })
})
