import type { APIRoute } from 'astro'

import { createActor } from '@api/actors'
import { ActorCreateSchema, type ActorFormModel, type CustomAstroLocals } from '@ts-types/entities'
import { HTTP_STATUS } from '@ts/constants'
import {
  parseHttpErrorToResponse,
  parseMessageToResponse,
  parseRequestToModel,
  parseValueToIsoDate
} from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ locals, request }) => {
  const newActorModel = await parseRequestToModel<ActorFormModel>(request)
  const actorCreationZod = await ActorCreateSchema.safeParseAsync(newActorModel)

  if (actorCreationZod.error) {
    const actorCreateZodError = actorCreationZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(actorCreateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const genreCreated = await createActor({
      ...newActorModel,
      bornDate: parseValueToIsoDate(newActorModel.bornDate),
      deadDate: newActorModel.deadDate ? parseValueToIsoDate(newActorModel.deadDate) : null,
      id: v6(),
      loggedUserId: (locals as CustomAstroLocals).loggedUserId
    })

    return parseMessageToResponse(genreCreated, HTTP_STATUS.OK)
  } catch (_createActorError) {
    return parseHttpErrorToResponse(_createActorError)
  }
}
