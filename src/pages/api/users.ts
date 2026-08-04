import type { APIRoute } from 'astro'

import { createUser } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import {
  UserBaseSchema,
  UserCreateSchema,
  type UserFormModel,
  type UserUpdateFormModel,
  type UserWithToken
} from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
import { HttpError } from '@ts/types'
import { v6 } from 'uuid'

export const POST: APIRoute = async ({ cookies, request }) => {
  const newUserModel = await parseRequestToModel<UserFormModel>(request)
  const { email, name, password, repeatPassword, username } = newUserModel

  if (!username || !email || !password || !repeatPassword) {
    return parseMessageToResponse(USER_ERROR_MESSAGES.MISSING_FIELDS, HTTP_STATUS.BAD_REQUEST)
  }

  if (password !== repeatPassword) {
    return parseMessageToResponse(USER_ERROR_MESSAGES.PASSWORD_MISMATCH, HTTP_STATUS.BAD_REQUEST)
  }

  const { error: zodError } = await UserCreateSchema.safeParseAsync(newUserModel)

  if (zodError) {
    const userCreateZodError = zodError.issues.map(({ message }) => message)
    return parseMessageToResponse(userCreateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const userCreated = (await createUser({
      email,
      id: v6(),
      name,
      password,
      username
    })) as UserWithToken

    cookies.set(SESSION_COOKIE_NAME, userCreated.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: true
    })

    return parseMessageToResponse(userCreated, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}

export const PATCH: APIRoute = async ({ cookies, request }) => {
  const loggedToken = cookies.get(SESSION_COOKIE_NAME)

  if (!loggedToken) {
    return parseHttpErrorToResponse(new HttpError(HTTP_STATUS.BAD_REQUEST, 'No token provided'))
  }

  const userUpdateModel = await parseRequestToModel<UserUpdateFormModel>(request)

  const zod = await UserBaseSchema.safeParseAsync(userUpdateModel)

  if (zod.error) {
    return parseMessageToResponse('NO PATCH USER', HTTP_STATUS.BAD_REQUEST)
  }

  const alreadyExistsUser = true

  if (alreadyExistsUser) {
    return parseMessageToResponse('NO PATCH USER', HTTP_STATUS.BAD_REQUEST)
  }

  const findedUser = true

  if (!findedUser) {
    return parseMessageToResponse('NO PATCH USER', HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const updatedUser = true

    return parseMessageToResponse(updatedUser, HTTP_STATUS.OK)
  } catch (apiError) {
    return parseHttpErrorToResponse(apiError)
  }
}
