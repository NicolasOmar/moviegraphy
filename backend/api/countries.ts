import type { CountriesModel } from '@models'
import type { GetMany } from '@ts/types'

import prismaInstance from '@prisma/index'
import { parseApiErrorToHttpError } from '@ts/parsers'

/** `[GET]` function for registered countries
 *
 * @returns A list of `CountriesModel`
 */
export const getCountryList: GetMany<null, CountriesModel> = async () => {
  try {
    return await prismaInstance.countries.findMany()
  } catch (_getCountryListError) {
    throw parseApiErrorToHttpError(_getCountryListError, '[GET /api/countries]')
  }
}
