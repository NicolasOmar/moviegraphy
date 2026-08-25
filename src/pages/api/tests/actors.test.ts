import type { APIContext } from 'astro'

import { createActor } from '@api/actors'
import { HTTP_STATUS } from '@ts/constants'
import { actorMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '../actors'

vi.mock('@api/actors', () => ({
  createActor: vi.fn<typeof createActor>()
}))
vi.mock('uuid', () => ({ v6: () => 'fixed-test-id' }))

const mockedCreateActor = vi.mocked(createActor)

beforeEach(() => {
  vi.clearAllMocks()
})

const loggedUserId = actorMocks[0].userId

const buildContext = (formData: FormData): APIContext =>
  ({
    locals: { loggedUserId },
    request: new Request('http://localhost/api/actors', { body: formData, method: 'POST' })
  }) as unknown as APIContext

const buildValidFormData = (overrides: Record<string, string> = {}): FormData => {
  const [actor] = actorMocks
  const formData = new FormData()
  const fields = {
    bornDate: actor.bornDate.toISOString(),
    countries: 'country-1,country-2',
    deadDate: '',
    genderId: actor.genderId,
    lastName: actor.lastName,
    name: actor.name,
    ...overrides
  }

  Object.entries(fields).forEach(([key, value]) => formData.append(key, value))

  return formData
}

describe('POST', () => {
  it('parses form data, generates an id, converts bornDate to an ISO date, and returns 200', async () => {
    const [actor] = actorMocks
    mockedCreateActor.mockResolvedValue(actor)

    const response = await POST(buildContext(buildValidFormData()))

    expect(mockedCreateActor).toHaveBeenCalledWith({
      bornDate: new Date(actor.bornDate.toISOString()),
      countries: 'country-1,country-2',
      deadDate: null,
      genderId: actor.genderId,
      id: 'fixed-test-id',
      lastName: actor.lastName,
      loggedUserId,
      name: actor.name
    })
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: JSON.parse(JSON.stringify(actor)) })
  })

  it('converts a provided deadDate to an ISO date instead of null', async () => {
    const [actor] = actorMocks
    mockedCreateActor.mockResolvedValue(actor)
    const deadDate = '2020-01-01T00:00:00.000Z'

    await POST(buildContext(buildValidFormData({ deadDate })))

    expect(mockedCreateActor).toHaveBeenCalledWith(
      expect.objectContaining({ deadDate: new Date(deadDate) })
    )
  })

  it('returns 400 with the joined Zod issue messages when the payload fails schema validation', async () => {
    const response = await POST(buildContext(buildValidFormData({ name: 'a' })))

    expect(mockedCreateActor).not.toHaveBeenCalled()
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(await response.json()).toEqual({
      message: ['Too small: expected string to have >=2 characters']
    })
  })

  it('propagates the status and message carried by an HttpError when createActor rejects', async () => {
    mockedCreateActor.mockRejectedValue(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'create failed')
    )

    const response = await POST(buildContext(buildValidFormData()))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: 'create failed' })
  })
})
