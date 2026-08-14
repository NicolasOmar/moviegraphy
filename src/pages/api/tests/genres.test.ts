import type { APIContext } from 'astro'

import { createGenre, updateGenre } from '@api/genres'
import { HTTP_STATUS } from '@ts/constants'
import { genreMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH, POST } from '../genres'

vi.mock('@api/genres', () => ({
  createGenre: vi.fn<typeof createGenre>(),
  updateGenre: vi.fn<typeof updateGenre>()
}))

const mockedCreateGenre = vi.mocked(createGenre)
const mockedUpdateGenre = vi.mocked(updateGenre)

beforeEach(() => {
  vi.clearAllMocks()
})

const buildContext = (formData: FormData, method: 'PATCH' | 'POST' = 'POST'): APIContext =>
  ({
    cookies: { get: vi.fn().mockReturnValue({ value: 'raw-token' }) },
    request: new Request('http://localhost/api/genres', { body: formData, method })
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
    expect(await response.json()).toEqual({ message: genre })
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

describe('PATCH', () => {
  it('parses form data, forwards the session token and id, and returns 200', async () => {
    const [genre] = genreMocks
    const updatedGenre = { ...genre, name: 'Sci-Fi Renamed' }
    const formData = new FormData()
    formData.append('id', genre.id)
    formData.append('name', updatedGenre.name)
    mockedUpdateGenre.mockResolvedValue(updatedGenre)

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(mockedUpdateGenre).toHaveBeenCalledWith({
      id: genre.id,
      name: updatedGenre.name,
      sessionToken: 'raw-token'
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: updatedGenre })
  })

  it('returns 400 with the joined Zod issue messages when the payload fails schema validation', async () => {
    const [genre] = genreMocks
    const formData = new FormData()
    formData.append('id', genre.id)
    formData.append('name', 'x'.repeat(301))

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(mockedUpdateGenre).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too big: expected string to have <=300 characters']
    })
  })

  it('returns 400 when the id is missing or not a valid uuid', async () => {
    const [genre] = genreMocks
    const formData = new FormData()
    formData.append('id', 'not-a-uuid')
    formData.append('name', genre.name)

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(mockedUpdateGenre).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Invalid UUID']
    })
  })

  it('propagates the status and message carried by an HttpError when updateGenre rejects', async () => {
    const [genre] = genreMocks
    const formData = new FormData()
    formData.append('id', genre.id)
    formData.append('name', genre.name)
    mockedUpdateGenre.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'update failed')
    )

    const response = await PATCH(buildContext(formData, 'PATCH'))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'update failed' })
  })
})
