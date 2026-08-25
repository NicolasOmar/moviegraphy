import type { ActorsModel } from '@models'
import type { ActorApiModel } from '@ts/entities'

import prismaInstance from '@prisma/index'
import { HTTP_STATUS } from '@ts/constants'
import { parseApiErrorToHttpError, parseIdStringToArray } from '@ts/parsers'
import { type CreateOrUpdateOne, HttpError } from '@ts/types'

/** `[CREATE]` function for actors
 *
 * - If the provided name on the genre has been already added, it will return an error
 *
 * @param _actorFormData - A `ActorApiModel` object to be created in the database
 * @returns The new `ActorsModel`
 */
export const createActor: CreateOrUpdateOne<ActorApiModel, ActorsModel> = async _actorFormData => {
  try {
    const { countries, loggedUserId, ...actorToCreate } = _actorFormData
    const parsedCountries = parseIdStringToArray(countries).map(_countryId => ({
      countryId: _countryId
    }))
    const alreadyUsedName = await prismaInstance.actors.findUnique({
      where: { id: '', lastName: _actorFormData.lastName, name: _actorFormData.name }
    })

    if (alreadyUsedName) {
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used')
    }

    return await prismaInstance.actors.create({
      data: {
        ...actorToCreate,
        countries: { create: parsedCountries },
        userId: loggedUserId
      }
    })
  } catch (_createActorError) {
    throw parseApiErrorToHttpError(_createActorError, '[POST /api/actors]')
  }
}
