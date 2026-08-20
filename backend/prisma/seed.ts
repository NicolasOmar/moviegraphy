import 'dotenv/config'
import type { CountriesModel } from '@models'

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '../prisma/generated/client'
import rawCountryList from './countries.json'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const seededCountries = await prisma.countries.createMany({
    data: rawCountryList.countries.map(_country => {
      return {
        alpha2: _country.alpha2,
        alpha3: _country.alpha3,
        id: _country.alpha2,
        name: _country.name,
        officialName: _country.official_name
      } as CountriesModel
    })
  })
  console.log({ seededCountries })
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
