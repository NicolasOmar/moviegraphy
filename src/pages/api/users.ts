import type { APIRoute } from 'astro'

import { createUser, findUserBySession, findUserByUsername, updateUser } from '@api/users'
import { HTTP_STATUS, SESSION_COOKIE_NAME, USER_ERROR_MESSAGES } from '@ts/constants'
import {
  UserCreateSchema,
  type UserFormModel,
  UserPatchSchema,
  type UserUpdateModel,
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

    cookies.set(SESSION_COOKIE_NAME, userCreated.sessionToken, {
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

  const userUpdateModel = await parseRequestToModel<UserUpdateModel>(request)

  const zod = await UserPatchSchema.safeParseAsync(userUpdateModel)

  if (zod.error) {
    return parseMessageToResponse(zod.error, HTTP_STATUS.BAD_REQUEST)
  }

  try {
    const isUserNameAlreadyUser = (await findUserByUsername({
      username: userUpdateModel.username
    })) as boolean

    if (isUserNameAlreadyUser) {
      return parseMessageToResponse(
        `Username '${userUpdateModel.username}' already taken`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const findedUserId = await findUserBySession(loggedToken.value)

    if (!findedUserId) {
      return parseMessageToResponse('NO PATCH USER', HTTP_STATUS.BAD_REQUEST)
    }

    const updatedUser = updateUser({
      id: findedUserId,
      name: userUpdateModel.name,
      username: userUpdateModel.username
    })

    return parseMessageToResponse(updatedUser, HTTP_STATUS.OK)
  } catch (apiError) {
    return parseHttpErrorToResponse(apiError)
  }
}
