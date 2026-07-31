import type { UserLoginModel, UserWithToken } from '@ts/entities'

import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { compareHashed, createToken, hashToken } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
import { type CreateOrUpdateOne, type DeleteOne, HttpError } from '@ts/types'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'

export const isSessionValid = async (rawToken: string): Promise<boolean> => {
  try {
    const hashedToken = hashToken(rawToken)
    const refreshToken = await prismaInstance.sessions.findFirst({
      where: { expiresAt: { gt: new Date() }, token: hashedToken }
    })

    return Boolean(refreshToken)
  } catch (error) {
    const errorMessage = handleErrorMessage(error)

    console.error('[middleware] refresh token validation failed', { errorMessage })

    return false
  }
}

export const loginUser: CreateOrUpdateOne<UserLoginModel, UserWithToken> = async ({
  name,
  password
}) => {
  try {
    const user = await prismaInstance.users.findFirst({
      where: { OR: [{ name }, { email: name }] }
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

    if (getUserByCredentialsError instanceof HttpError) {
      throw getUserByCredentialsError
    }

    const errorMessage = handleErrorMessage(getUserByCredentialsError)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}

export const logoutUser: DeleteOne = async token => {
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
