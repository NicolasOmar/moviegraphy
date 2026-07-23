import { fileURLToPath } from 'node:url'

const resolvePath = (relativePath: string): string => fileURLToPath(new URL(relativePath, import.meta.url))

export const sharedAlias = {
  '@api': resolvePath('../prisma/api'),
  '@assets': resolvePath('../src/assets'),
  '@components': resolvePath('../src/components'),
  '@islands': resolvePath('../src/islands'),
  '@layouts': resolvePath('../src/layouts'),
  '@models': resolvePath('../prisma/generated/models'),
  '@schemas': resolvePath('../prisma/schemas'),
  '@store': resolvePath('../store'),
  '@ts': resolvePath('../ts'),
  ts: resolvePath('../ts')
}
