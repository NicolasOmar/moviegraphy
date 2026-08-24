import type { GendersModel } from '@models'
import type { GetMany } from '@ts/types'

import prismaInstance from '@prisma/index'
import { parseApiErrorToHttpError } from '@ts/parsers'

/** `[GET]` function for registered movies
 *
 * @param _loggeduserId - Logged user's id to access its registered movies
 * @returns A list of `MoviesModel`
 */
export const getGenderList: GetMany<null, GendersModel> = async () => {
  try {
    return await prismaInstance.genders.findMany()
  } catch (_getGenderListError) {
    throw parseApiErrorToHttpError(_getGenderListError, '[GET /api/genders]')
  }
}
