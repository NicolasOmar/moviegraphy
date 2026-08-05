import type { APIRoute } from 'astro'

import { isSessionValid } from '@api/sessions'
import { updatePassword } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { type PasswordChangeModel, PasswordChangeSchema } from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
import { HttpError } from '@ts/types'

export const POST: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value
  const tokenResponse = await isSessionValid(sessionToken)

  if (!tokenResponse) {
    return parseMessageToResponse('No token provided', HTTP_STATUS.BAD_REQUEST)
  }

  const passwordsModel = await parseRequestToModel<PasswordChangeModel>(request)

  if (
    passwordsModel.old === passwordsModel.new ||
    passwordsModel.new !== passwordsModel.repeatNew
  ) {
    return parseHttpErrorToResponse(
      new HttpError(HTTP_STATUS.BAD_REQUEST, 'Passwords are not the same')
    )
  }

  const { error: zodError } = await PasswordChangeSchema.safeParseAsync(passwordsModel)

  if (zodError) {
    const passwordUpdateZodMessage = zodError.issues.map(({ message }) => message)

    return parseMessageToResponse(passwordUpdateZodMessage, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const updatedPassword = (await updatePassword({
      newPassword: passwordsModel.new,
      oldPassword: passwordsModel.old,
      sessionToken: sessionToken!
    })) as boolean

    return parseMessageToResponse(updatedPassword, HTTP_STATUS.OK)
  } catch (apiError) {
    return parseHttpErrorToResponse(apiError)
  }
}
