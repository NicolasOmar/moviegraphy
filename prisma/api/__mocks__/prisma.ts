import { mockDeep } from 'vitest-mock-extended'

import type { PrismaClient } from '../../generated/client'

const prisma = mockDeep<PrismaClient>()

export default prisma
