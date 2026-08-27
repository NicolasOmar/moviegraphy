import { fileURLToPath } from 'node:url'

const resolvePath = (relativePath: string): string => fileURLToPath(new URL(relativePath, import.meta.url))

export const sharedAlias = {
  'astro:middleware': resolvePath('./mocks/astro-middleware'),
  '@api': resolvePath('../backend/api'),
  '@assets': resolvePath('../src/assets'),
  '@components': resolvePath('../src/components'),
  '@islands': resolvePath('../src/islands'),
  '@layouts': resolvePath('../src/layouts'),
  '@models': resolvePath('../backend/prisma/generated/models'),
  '@schemas': resolvePath('../backend/prisma/schemas'),
  '@store': resolvePath('../store'),
  '@ts-types': resolvePath('../ts/types'),
  '@ts': resolvePath('../ts'),
  ts: resolvePath('../ts')
}
