import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../prisma/generated/client'

const adapter = new PrismaPg({
  connectionString: import.meta.env.DATABASE_URL
})

const prisma = new PrismaClient({
  adapter
})

export default prisma
