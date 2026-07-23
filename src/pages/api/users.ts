export const prerender = false
import type { UserFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { UserCreateSchema } from '@schemas/user'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/errors'
import {
  handleErrorMessage,
  parseFormDataToModel,
  parseHttpErrorToResponse,
  parseMessageToResponse
} from '@ts/parsers'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ request }) => {
  const newUserFormData = await request.formData()
  const newUserModel = parseFormDataToModel<UserFormModel>(newUserFormData)
  const { email, name, password, repeatPassword } = newUserModel

  if (!name || !email || !password || !repeatPassword) {
    return parseMessageToResponse(USER_ERROR_MESSAGES.MISSING_FIELDS, HTTP_STATUS.BAD_REQUEST)
  }

  if (password !== repeatPassword) {
    return parseMessageToResponse(USER_ERROR_MESSAGES.PASSWORD_MISMATCH, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const { error } = await UserCreateSchema.safeParseAsync(newUserModel)

    if (error) {
      const userCreateZodMessage = error.issues.map(({ message }) => message)
      return parseMessageToResponse(userCreateZodMessage, HTTP_STATUS.BAD_REQUEST)
    }

    const userCreated = await createUser({ email, id: v6(), name, password })

    return parseMessageToResponse(userCreated, HTTP_STATUS.OK)
  } catch (error) {
    if (!(error instanceof HttpError)) {
      console.error(`[POST /api/users] ${handleErrorMessage(error)}`)
    }

    return parseHttpErrorToResponse(error)
  }
}
