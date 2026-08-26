import type { APIRoute } from 'astro'

import { updatePassword } from '@api/users'
import {
  type CustomAstroLocals,
  type PasswordUpdateFormModel,
  PasswordUpdateSchema
} from '@ts-types/entities'
import { HTTP_STATUS } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ locals, request }) => {
  const passwordUpdateModel = await parseRequestToModel<PasswordUpdateFormModel>(request)

  if (
    passwordUpdateModel.old === passwordUpdateModel.new ||
    passwordUpdateModel.new !== passwordUpdateModel.repeatNew
  ) {
    return parseMessageToResponse('Passwords are not the same', HTTP_STATUS.BAD_REQUEST)
  }

  const passwordUpdateZod = await PasswordUpdateSchema.safeParseAsync(passwordUpdateModel)

  if (passwordUpdateZod.error) {
    const passwordUpdateZodError = passwordUpdateZod.error.issues.map(({ message }) => message)

    return parseMessageToResponse(passwordUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const updatedPassword = (await updatePassword({
      loggedUserId: (locals as CustomAstroLocals).loggedUserId,
      newPassword: passwordUpdateModel.new,
      oldPassword: passwordUpdateModel.old
    })) as boolean

    return parseMessageToResponse(updatedPassword, HTTP_STATUS.OK)
  } catch (_updatePasswordError) {
    return parseHttpErrorToResponse(_updatePasswordError)
  }
}
