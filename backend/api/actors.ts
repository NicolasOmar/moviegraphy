import type { ActorApiModel, ActorFormModel } from '@ts/entities'

import prismaInstance from '@prisma/index'
import { HTTP_STATUS } from '@ts/constants'
import { parseApiErrorToHttpError } from '@ts/parsers'
import { type CreateOrUpdateOne, HttpError } from '@ts/types'
import { v6 } from 'uuid'

export const createActor: CreateOrUpdateOne<ActorApiModel, ActorFormModel> = async _actorModel => {
  try {
    const { loggedUserId, ...actorToCreate } = _actorModel
    const alreadyUsedName = await prismaInstance.actors.findUnique({
      where: { id: '', lastName: _actorModel.lastName, name: _actorModel.name }
    })

    if (alreadyUsedName) {
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Name already used')
    }

    return await prismaInstance.actors.create({
      data: {
        ...actorToCreate,
        id: v6(),
        userId: loggedUserId
      }
    })
  } catch (_createActorError) {
    throw parseApiErrorToHttpError(_createActorError, '[POST /api/actors]')
  }
}
