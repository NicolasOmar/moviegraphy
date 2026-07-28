import type { UsersModel } from '@models'
import type { UserLoginModel, UserWithToken } from '@ts/entities'
import type { CreateOrUpdateOne, DeleteOne } from '@ts/types'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { createRefreshToken, hashToken } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
import { HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { Prisma } from '../prisma/generated/client'

export const createUser: CreateOrUpdateOne<UsersModel, UserWithToken> = async newUser => {
  try {
    const createdUser = await prismaInstance.users.create({ data: newUser })
    const rawToken = createRefreshToken(createdUser.id)
    const hashedToken = hashToken(rawToken)
    const tokenCreated = await prismaInstance.sessions.create({
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        id: v6(),
        token: hashedToken,
        userId: createdUser.id
      }
    })

    console.warn({
      hashedToken,
      rawToken,
      tokenCreated
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

export const getUserByCredentials: CreateOrUpdateOne<UserLoginModel, UserWithToken> = async ({
  name,
  password
}) => {
  try {
    const user = await prismaInstance.users.findFirst({
      where: { OR: [{ name }, { email: name }], password }
    })

    if (!user) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const rawToken = createRefreshToken(user.id)
    const hashedToken = hashToken(rawToken)

    await prismaInstance.sessions.create({
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        id: v6(),
        token: hashedToken,
        userId: user.id
      }
    })

    return {
      email: user.email,
      token: rawToken
    }
  } catch (getUserByCredentialsError) {
    console.error('[POST /api/users]', { error: getUserByCredentialsError })

    const errorMessage = handleErrorMessage(getUserByCredentialsError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

export const logOutUser: DeleteOne = async token => {
  const hashedToken = hashToken(token)

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
