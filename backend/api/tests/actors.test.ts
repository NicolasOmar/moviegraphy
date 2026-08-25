import { HTTP_STATUS } from '@ts/constants'
import { actorMocks } from '@ts/mocks'
import { HttpError } from '@ts/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import prisma from '../../prisma'
import { createActor } from '../actors'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('createActor', () => {
  it('creates an actor for the logged user, splitting the countries string into related records', async () => {
    const [actor] = actorMocks
    mockedPrisma.actors.findUnique.mockResolvedValue(null)
    mockedPrisma.actors.create.mockResolvedValue(actor)

    const result = await createActor({
      bornDate: actor.bornDate,
      countries: 'country-1,country-2',
      deadDate: actor.deadDate,
      genderId: actor.genderId,
      id: actor.id,
      lastName: actor.lastName,
      loggedUserId: actor.userId,
      name: actor.name
    })

    expect(mockedPrisma.actors.findUnique).toHaveBeenCalledWith({
      where: { name_lastName: { lastName: actor.lastName, name: actor.name } }
    })
    expect(mockedPrisma.actors.create).toHaveBeenCalledWith({
      data: {
        bornDate: actor.bornDate,
        countries: { create: [{ countryId: 'country-1' }, { countryId: 'country-2' }] },
        deadDate: actor.deadDate,
        genderId: actor.genderId,
        id: actor.id,
        lastName: actor.lastName,
        name: actor.name,
        userId: actor.userId
      }
    })
    expect(result).toEqual(actor)
  })

  it('creates an actor with no related countries when countries is empty', async () => {
    const [actor] = actorMocks
    mockedPrisma.actors.findUnique.mockResolvedValue(null)
    mockedPrisma.actors.create.mockResolvedValue(actor)

    await createActor({
      bornDate: actor.bornDate,
      countries: '',
      deadDate: actor.deadDate,
      genderId: actor.genderId,
      id: actor.id,
      lastName: actor.lastName,
      loggedUserId: actor.userId,
      name: actor.name
    })

    expect(mockedPrisma.actors.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ countries: { create: [] } }) })
    )
  })

  it('rejects with a 500 HttpError and never creates when the name/lastName combination is already taken', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [actor] = actorMocks
    mockedPrisma.actors.findUnique.mockResolvedValue(actor)

    await expect(
      createActor({
        bornDate: actor.bornDate,
        countries: '',
        deadDate: actor.deadDate,
        genderId: actor.genderId,
        id: actor.id,
        lastName: actor.lastName,
        loggedUserId: actor.userId,
        name: actor.name
      })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used'))
    expect(mockedPrisma.actors.create).not.toHaveBeenCalled()
  })

  it('wraps a rejection from actors.create into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [actor] = actorMocks
    mockedPrisma.actors.findUnique.mockResolvedValue(null)
    mockedPrisma.actors.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(
      createActor({
        bornDate: actor.bornDate,
        countries: '',
        deadDate: actor.deadDate,
        genderId: actor.genderId,
        id: actor.id,
        lastName: actor.lastName,
        loggedUserId: actor.userId,
        name: actor.name
      })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed'))
  })

  it('wraps a non-Error rejection from actors.findUnique into a 500 HttpError with the stringified value', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [actor] = actorMocks
    mockedPrisma.actors.findUnique.mockRejectedValue('connection refused')

    await expect(
      createActor({
        bornDate: actor.bornDate,
        countries: '',
        deadDate: actor.deadDate,
        genderId: actor.genderId,
        id: actor.id,
        lastName: actor.lastName,
        loggedUserId: actor.userId,
        name: actor.name
      })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused'))
  })
})
