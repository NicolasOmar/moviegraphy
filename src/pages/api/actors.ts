import type { APIRoute } from 'astro'

import { createActor } from '@api/actors'
import { HTTP_STATUS } from '@ts/constants'
import { ActorCreateSchema, type ActorFormModel, type CustomAstroLocals } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

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
      loggedUserId: (locals as CustomAstroLocals).loggedUserId
    })

    return parseMessageToResponse(genreCreated, HTTP_STATUS.OK)
  } catch (_createActorError) {
    return parseHttpErrorToResponse(_createActorError)
  }
}
