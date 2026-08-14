import type { APIRoute } from 'astro'

import { updatePassword } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { type PasswordUpdateFormModel, PasswordUpdateSchema } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value
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
      newPassword: passwordUpdateModel.new,
      oldPassword: passwordUpdateModel.old,
      sessionToken: sessionToken!
    })) as boolean

    return parseMessageToResponse(updatedPassword, HTTP_STATUS.OK)
  } catch (apiError) {
    return parseHttpErrorToResponse(apiError)
  }
}
