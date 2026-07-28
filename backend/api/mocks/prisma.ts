import { mockDeep } from 'vitest-mock-extended'

import type { PrismaClient } from '../../prisma/generated/client'

const prisma = mockDeep<PrismaClient>()

export default prisma
