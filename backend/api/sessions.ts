import type { UserLoginModel, UserWithToken } from '@ts/entities'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { getCurrentISODate, getISODateWithDaysOffset } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
import { compareHashed, createToken, hashToken } from '@ts/tokens'
import { type CreateOrUpdateOne, type DeleteOne, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'

/**
 * Asks for a raw session token, it looks for it in the registered sessions for its existence.
 *
 * @param _rawToken token without hashing (that could even not be sended)
 * @returns A boolean if is a valid one or not.
 */
export const isSessionValid = async (_rawToken?: null | string): Promise<boolean> => {
  if (_rawToken === undefined || _rawToken === null) {
    return false
  }

  try {
    const hashedToken = hashToken(_rawToken)
    const refreshToken = await prismaInstance.sessions.findFirst({
      where: { expiresAt: { gt: getCurrentISODate() }, token: hashedToken }
    })

    return Boolean(refreshToken)
  } catch (error) {
    const errorMessage = handleErrorMessage(error)

    console.error('[middleware] refresh token validation failed', { errorMessage })

    return false
  }
}

/**
 * - Looks for the user in the database using its password or username
 *    - If it does not exists, it will return INVALID_CREDENTIALS error
 * - Looks that the provided password by the user is the same as its hashed countrapart
 *    - If it does not exists, it will return INVALID_CREDENTIALS error
 * - Creates a new token from users's id and hashes it
 * - Creates a session
 *
 * @param _userToLogin of type `UserLoginModel`
 * @returns An `UserWithToken`
 */
export const loginUser: CreateOrUpdateOne<UserLoginModel, UserWithToken> = async ({
  password,
  username
}) => {
  try {
    const user = await prismaInstance.users.findFirst({
      where: { OR: [{ username }, { email: username }] }
    })

    if (!user) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const passwordsMatch = await compareHashed(password, user.password)

    if (!passwordsMatch) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const rawToken = createToken(user.id)
    const hashedToken = hashToken(rawToken)

    await prismaInstance.sessions.create({
      data: {
        expiresAt: getISODateWithDaysOffset(7),
        id: v6(),
        token: hashedToken,
        userId: user.id
      }
    })

    return {
      email: user.email,
      sessionToken: rawToken
    }
  } catch (getUserByCredentialsError) {
    console.error('[POST /api/users]', { error: getUserByCredentialsError })

    if (getUserByCredentialsError instanceof HttpError) {
      throw getUserByCredentialsError
    }

    const errorMessage = handleErrorMessage(getUserByCredentialsError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

/**
 * - Hashes the provided token
 * - Deletes the saved session from the hashed token
 *
 * @param _token A raw session token in string format
 * @returns True
 */
export const logoutUser: DeleteOne = async _token => {
  const hashedToken = hashToken(_token)

  try {
    await prismaInstance.sessions.delete({
      where: { token: hashedToken }
    })

    return new Promise(resolve => resolve(true))
  } catch (logOutError) {
    console.error('[POST /api/sessions]', { error: logOutError })

    const errorMessage = handleErrorMessage(logOutError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
