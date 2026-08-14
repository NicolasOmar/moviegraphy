import type { UsersModel } from '@models'
import type { PasswordUpdateModel, UserUpdateFormModel } from '@ts/entities'
import type { CreateOrUpdateOne, GetOne } from '@ts/types'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { getISODateWithDaysOffset } from '@ts/helpers'
import { parseApiErrorToHttpError } from '@ts/parsers'
import { compareHashed, createToken, hashString, hashToken } from '@ts/tokens'
import { HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { Prisma } from '../prisma/generated/client'

/** `[CREATE]` function for users
 *
 * - Hashes the _newUser password
 * - Creates the user with the hashed password
 * - Creates a raw session token based on the newly created user
 * - Creates a hashed version of the raw session token
 * - Creates a session registry using the hashed session token and user id
 *
 * @param _newUser - A `UsersModel` object to be inserted into the database
 * @returns The new `UserWithTokenModel` (includes a `sessionToken` to be added as a cookie)
 */
export const createUser: CreateOrUpdateOne<UsersModel, string> = async _newUser => {
  try {
    const hashedPassword = await hashString(_newUser.password)
    const createdUser = await prismaInstance.users.create({
      data: {
        ..._newUser,
        password: hashedPassword
      }
    })
    const rawToken = createToken(createdUser.id)
    const hashedToken = hashToken(rawToken)

    await prismaInstance.sessions.create({
      data: {
        expiresAt: getISODateWithDaysOffset(7),
        id: v6(),
        token: hashedToken,
        userId: createdUser.id
      }
    })

    return rawToken
  } catch (_createUserError) {
    if (
      _createUserError instanceof Prisma.PrismaClientKnownRequestError &&
      _createUserError.code === 'P2002'
    ) {
      console.error('[POST /api/users]', { error: _createUserError })
      throw new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    }

    throw parseApiErrorToHttpError(_createUserError, '[POST /api/users]')
  }
}

/** `[UPDATE]` function for users
 *
 * @returns A true value when the creted user has been updated in the database
 * @param _updatedUser - A `UserUpdateFormModel` object to update an already created one
 */
export const updateUser: CreateOrUpdateOne<UserUpdateFormModel> = async ({
  name,
  sessionToken,
  username
}) => {
  try {
    const findedUserId = await findUserBySession(sessionToken)

    if (!findedUserId) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'NO PATCH USER')
    }

    const isUserNameAlreadyUser = await findUserByUsername({
      username
    })

    if (isUserNameAlreadyUser) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, `Username '${username}' is already taken`)
    }

    await prismaInstance.users.update({
      data: { name: name ?? null, username },
      where: { id: findedUserId }
    })

    return true
  } catch (_updateUserError) {
    throw parseApiErrorToHttpError(_updateUserError, '[PATCH /api/users]')
  }
}

/** `[UPDATE]` function for a created user's password
 *
 * - Hashed the provided `sessionToken`
 * - Looks for the created session from the `hashedToken`
 *    - If does not exists, it returns an `INVALID_CREDENTIALS` error
 * - Looks for the logged user from the `existingSession`
 *    - If does not exists, it returns an `INVALID_CREDENTIALS` error
 * - Look the `oldPassword` is the same as the previous/hashed one form the logged user
 *    - If does not exists, it returns an `PASSWORD_MISMATCH` error
 * - Hashes the new password and updates the user with it
 *
 * @param _modifiedPassword - A `PasswordUpdateModel` object to update an already created one
 * @returns A true value when the password has been updated in the database
 */
export const updatePassword: CreateOrUpdateOne<PasswordUpdateModel, boolean> = async ({
  newPassword,
  oldPassword,
  sessionToken
}) => {
  const hashedToken = hashToken(sessionToken)

  try {
    const existingSession = await prismaInstance.sessions.findFirst({
      where: { token: hashedToken }
    })

    if (!existingSession) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const loggedUser = await prismaInstance.users.findUnique({
      where: { id: existingSession.userId }
    })

    if (!loggedUser) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const areSamePasswords = await compareHashed(oldPassword, loggedUser.password)

    if (!areSamePasswords) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.PASSWORD_MISMATCH)
    }

    const hashedNewPassword = await hashString(newPassword)

    await prismaInstance.users.update({
      data: { password: hashedNewPassword },
      where: { id: loggedUser.id }
    })

    return true
  } catch (_updatePasswordError) {
    throw parseApiErrorToHttpError(_updatePasswordError, '[POST /api/passwords]')
  }
}
/** `[GET]` function for registered users by its `username`
 *
 * @returns A boolean value if the user with the provided username exists or not
 */
export const findUserByUsername: GetOne<{ username: string }> = async ({ username }) => {
  try {
    const findedUser = await prismaInstance.users.findUnique({ where: { username } })

    return findedUser !== null
  } catch (_findUserByUsernameError) {
    throw parseApiErrorToHttpError(_findUserByUsernameError, '[GET /api/users]')
  }
}

/** `[GET]` function for registered users by its `sessionToken`
 *
 * @param _sessionToken - A string for the raw session token from the logged user
 * @returns Logged user's id
 */
export const findUserBySession: GetOne<string, string> = async _sessionToken => {
  const hashedToken = hashToken(_sessionToken)

  try {
    const loggedSession = await prismaInstance.sessions.findFirst({
      where: { token: hashedToken }
    })

    if (!loggedSession || !loggedSession.userId) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return loggedSession.userId
  } catch (_findUserBySessionError) {
    throw parseApiErrorToHttpError(_findUserBySessionError, '[GET /api/users]')
  }
}
