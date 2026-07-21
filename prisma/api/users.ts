import type { UserModel } from '@models'
import type { CreateOrUpdateOne } from '@ts/misc'

import prismaInstance from './prisma'

export const createUser: CreateOrUpdateOne<UserModel> = async newUser => {
  return await prismaInstance.user.create({ data: newUser })
}
