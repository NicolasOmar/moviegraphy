import type { GendersModel } from '@models'
import type { GetMany } from '@ts-types/api'

import { parseApiErrorToHttpError } from '@ts/parsers'

import prismaInstance from '../prisma'

/** `[GET]` function for registered genders
 *
 * @returns A list of `GendersModel`
 */
export const getGenderList: GetMany<null, GendersModel> = async () => {
  try {
    return await prismaInstance.genders.findMany()
  } catch (_getGenderListError) {
    throw parseApiErrorToHttpError(_getGenderListError, '[GET /api/genders]')
  }
}
