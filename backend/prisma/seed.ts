import 'dotenv/config'
import type { CountriesModel, GendersModel } from '@models'

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { v6 } from 'uuid'

import { PrismaClient } from '../prisma/generated/client'
import rawData from './rawData.json'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const parsedCountryList = rawData.countries.map(_rawCountry => {
    return {
      alpha2: _rawCountry.alpha2,
      alpha3: _rawCountry.alpha3,
      id: _rawCountry.alpha2,
      name: _rawCountry.name,
      officialName: _rawCountry.official_name
    } as CountriesModel
  })
  const parsedGenderList = rawData.genders.map(
    _rawGender =>
      ({
        id: v6(),
        name: _rawGender
      }) as GendersModel
  )

  const seededCountries = await prisma.countries.createMany({
    data: parsedCountryList
  })
  const seededGenders = await prisma.genders.createMany({
    data: parsedGenderList
  })

  console.log({ seededCountries, seededGenders })
}
main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
