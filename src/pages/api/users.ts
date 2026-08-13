import type { APIRoute } from 'astro'

import { createUser, updateUser } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import {
  UserCreateSchema,
  type UserFormModel,
  type UserUpdateModel,
  UserUpdateSchema
} from '@ts/entities'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'
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

  const userCreationZod = await UserCreateSchema.safeParseAsync(newUserModel)

  if (userCreationZod.error) {
    const userCreateZodError = userCreationZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(userCreateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const createdUserToken = await createUser({
      email,
      id: v6(),
      name,
      password,
      username
    })

    cookies.set(SESSION_COOKIE_NAME, createdUserToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: true
    })

    return parseMessageToResponse(createdUserToken, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}

export const PATCH: APIRoute = async ({ cookies, request }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value as string
  const userUpdateModel = await parseRequestToModel<UserUpdateModel>(request)
  const userCreateZod = await UserUpdateSchema.safeParseAsync(userUpdateModel)

  if (userCreateZod.error) {
    const userUpdateZodError = userCreateZod.error.issues.map(({ message }) => message)
    return parseMessageToResponse(userUpdateZodError, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const updatedUserResponse = (await updateUser({
      name: userUpdateModel.name,
      sessionToken,
      username: userUpdateModel.username
    })) as boolean

    return parseMessageToResponse(updatedUserResponse, HTTP_STATUS.OK)
  } catch (apiError) {
    return parseHttpErrorToResponse(apiError)
  }
}
