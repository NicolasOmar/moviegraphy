import type { UserModel } from '@models'
import type { UserLoginModel, UserWithToken } from '@ts/entities'
import type { CreateOrUpdateOne } from '@ts/types'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { createRefreshToken, hashToken } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
import { HttpError } from '@ts/types'
import { v6 } from 'uuid'

import { Prisma } from '../generated/client'
import prismaInstance from './prisma'

export const createUser: CreateOrUpdateOne<UserModel, UserWithToken> = async newUser => {
  try {
    const createdUser = await prismaInstance.user.create({ data: newUser })
    const rawToken = createRefreshToken(createdUser.id)
    const hashedToken = hashToken(rawToken)
    const tokenCreated = await prismaInstance.refreshToken.create({
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
  } catch (error) {
    console.error('[POST /api/users]', { error })

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    }

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

export const getUserByCredentials = async ({
  name,
  password
}: UserLoginModel): Promise<UserWithToken> => {
  const user = await prismaInstance.user.findFirst({
    where: { OR: [{ name }, { email: name }], password }
  })

  if (!user) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, USER_ERROR_MESSAGES.INVALID_CREDENTIALS)
  }

  const rawToken = createRefreshToken(user.id)
  const hashedToken = hashToken(rawToken)

  await prismaInstance.refreshToken.create({
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
}
