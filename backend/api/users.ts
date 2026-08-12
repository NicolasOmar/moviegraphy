import type { UsersModel } from '@models'
import type { PasswordChangeWithToken, UserUpdateModel, UserWithToken } from '@ts/entities'
import type { CreateOrUpdateOne, GetOne } from '@ts/types'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { getISODateWithDaysOffset } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
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
 * @returns The new `UserWithToken` (includes a `sessionToken` to be added as a cookie)
 */
export const createUser: CreateOrUpdateOne<UsersModel, UserWithToken> = async _newUser => {
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

    return {
      email: createdUser.email,
      sessionToken: rawToken
    }
  } catch (createUserError) {
    console.error('[POST /api/users]', { error: createUserError })

    if (
      createUserError instanceof Prisma.PrismaClientKnownRequestError &&
      createUserError.code === 'P2002'
    ) {
      throw new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    }

    const errorMessage = handleErrorMessage(createUserError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

/** `[UPDATE]` function for users
 *
 * @returns A true value when the creted user has been updated in the database
 * @param _updatedUser - A `UserUpdateModel` object to update an already created one
 */
export const updateUser: CreateOrUpdateOne<UserUpdateModel> = async ({ id, name, username }) => {
  try {
    await prismaInstance.users.update({
      data: { name: name ?? null, username },
      where: { id: id }
    })

    return true
  } catch (updateUserError) {
    console.error('[POST /api/users]', { error: updateUserError })

    if (updateUserError instanceof HttpError) {
      throw updateUserError
    }

    const errorMessage = handleErrorMessage(updateUserError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
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
 * @param _modifiedPassword - A `PasswordChangeWithToken` object to update an already created one
 * @returns A true value when the password has been updated in the database
 */
export const updatePassword: CreateOrUpdateOne<PasswordChangeWithToken, boolean> = async ({
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
  } catch (updatePasswordError) {
    console.error('[POST /api/users]', { error: updatePasswordError })

    if (updatePasswordError instanceof HttpError) {
      throw updatePasswordError
    }

    const errorMessage = handleErrorMessage(updatePasswordError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
/** `[GET]` function for registered users by its `username`
 *
 * @returns A boolean value if the user with the provided username exists or not
 */
export const findUserByUsername: GetOne<{ username: string }> = async ({ username }) => {
  try {
    const findedUser = await prismaInstance.users.findUnique({ where: { username } })

    return Promise.resolve(findedUser !== null)
  } catch (findUserByUsernameError) {
    console.error('[GET /api/users]', { error: findUserByUsernameError })

    if (findUserByUsernameError instanceof HttpError) {
      throw findUserByUsernameError
    }

    const errorMessage = handleErrorMessage(findUserByUsernameError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
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
  } catch (findUserBySessionError) {
    console.error('[GET /api/users]', { error: findUserBySessionError })

    if (findUserBySessionError instanceof HttpError) {
      throw findUserBySessionError
    }

    const errorMessage = handleErrorMessage(findUserBySessionError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
