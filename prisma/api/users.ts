import type { UserModel } from '@models'
import type { CreateOrUpdateOne } from '@ts/misc'

import { HTTP_STATUS } from '@ts/constants'
import { HttpError } from '@ts/errors'
import { handleError } from '@ts/parsers'

import prismaInstance from './prisma'

export const createUser: CreateOrUpdateOne<UserModel> = async newUser => {
  try {
    return await prismaInstance.user.create({ data: newUser })
  } catch (error) {
    const errorMessage = handleError(error)

    console.error('[POST /api/users]', { error, errorMessage })

    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, errorMessage)
  }
}
