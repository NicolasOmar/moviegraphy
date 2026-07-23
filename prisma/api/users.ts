import type { UserModel } from '@models'
import type { CreateOrUpdateOne } from '@ts/misc'

import { HTTP_STATUS } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { handleErrorMessage } from '@ts/parsers'

import { Prisma } from '../generated/client'
import prismaInstance from './prisma'

export const createUser: CreateOrUpdateOne<UserModel> = async newUser => {
  try {
    return await prismaInstance.user.create({ data: newUser })
  } catch (error) {
    console.error('[POST /api/users]', { error })

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'User email has already been taken')
    }

    const errorMessage = handleErrorMessage(error)

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
