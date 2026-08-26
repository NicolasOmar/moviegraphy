import type { CountriesModel } from '@models'
import type { GetMany } from '@ts-types/api'

import { parseApiErrorToHttpError } from '@ts/parsers'

import prismaInstance from '../prisma'

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
