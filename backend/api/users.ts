import type { UsersModel } from '@models'
import type { UserWithToken } from '@ts/entities'
import type { CreateOrUpdateOne } from '@ts/types'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import {
  compareHashed,
  createToken,
  getISODateWithDaysOffset,
  hashString,
  hashToken
} from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
import { HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { Prisma } from '../prisma/generated/client'

export const createUser: CreateOrUpdateOne<UsersModel, UserWithToken> = async newUser => {
  try {
    const hashedPassword = await hashString(newUser.password)
    const createdUser = await prismaInstance.users.create({
      data: {
        ...newUser,
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
      token: rawToken
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

export const updatePassword: CreateOrUpdateOne<
  { newPassword: string; oldPassword: string; sessionToken: string },
  boolean
> = async passwords => {
  const hashedToken = hashToken(passwords.sessionToken)

  try {
    const refreshToken = await prismaInstance.sessions.findFirst({
      where: { token: hashedToken }
    })

    if (!refreshToken) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const loggedUser = await prismaInstance.users.findUnique({ where: { id: refreshToken.userId } })

    if (!loggedUser) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const areSamePasswords = await compareHashed(passwords.oldPassword, loggedUser.password)

    if (!areSamePasswords) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.PASSWORD_MISMATCH)
    }

    const hashedNewPassword = await hashString(passwords.newPassword)

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
