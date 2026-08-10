import type { APIContext } from 'astro'

import { createGenre } from '@api/genres'
import { HTTP_STATUS } from '@ts/constants'
import { genreMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '../genres'

vi.mock('@api/genres', () => ({
  createGenre: vi.fn<typeof createGenre>()
}))

const mockedCreateGenre = vi.mocked(createGenre)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildContext = (formData: FormData): APIContext =>
  ({
    cookies: { get: vi.fn().mockReturnValue({ value: 'raw-token' }) },
    request: new Request('http://localhost/api/genres', { body: formData, method: 'POST' })
  }) as unknown as APIContext

describe('POST', () => {
  it('parses form data, forwards the session token from cookies, and returns 200', async () => {
    const [genre] = genreMocks
    const formData = new FormData()
    formData.append('name', genre.name)
    mockedCreateGenre.mockResolvedValue(genre)

    const response = await POST(buildContext(formData))

    expect(mockedCreateGenre).toHaveBeenCalledWith({
      name: genre.name,
      sessionToken: 'raw-token'
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: 'GO' })
  })

  it('returns 400 with the joined Zod issue messages when the payload fails schema validation', async () => {
    const formData = new FormData()
    formData.append('name', 'x'.repeat(301))

    const response = await POST(buildContext(formData))

    expect(mockedCreateGenre).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too big: expected string to have <=300 characters']
    })
  })

  it('propagates the status and message carried by an HttpError when createGenre rejects', async () => {
    const [genre] = genreMocks
    const formData = new FormData()
    formData.append('name', genre.name)
    mockedCreateGenre.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'create failed')
    )

    const response = await POST(buildContext(formData))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'create failed' })
  })
})
