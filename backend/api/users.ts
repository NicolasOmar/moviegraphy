import type { UsersModel } from '@models'
import type { UserWithToken } from '@ts/entities'
import type { CreateOrUpdateOne } from '@ts/types'

import { AUTH_CONSTANTS, HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { createToken, hashString } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'
import { HttpError } from '@ts/types'
import bcrypt from 'bcrypt'
import { v6 } from 'uuid'

import prismaInstance from '../prisma'
import { Prisma } from '../prisma/generated/client'

export const createUser: CreateOrUpdateOne<UsersModel, UserWithToken> = async newUser => {
  try {
    const hashedPassword = await bcrypt.hash(newUser.password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS)
    const createdUser = await prismaInstance.users.create({
      data: {
        ...newUser,
        password: hashedPassword
      }
    })
    const rawToken = createToken(createdUser.id)
    const hashedToken = hashString(rawToken)

    await prismaInstance.sessions.create({
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
