import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { compareHashed, createToken, hashString, hashToken } from '../tokens'

const JWT_SECRET_FOR_TESTS = 'test-jwt-secret'

describe('createToken', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', JWT_SECRET_FOR_TESTS)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('signs a JWT carrying the given userId that expires 7 days from now', () => {
    const token = createToken('user-1')

    const payload = jwt.verify(token, JWT_SECRET_FOR_TESTS) as {
      exp: number
      iat: number
      userId: string
    }

    expect(payload.userId).toBe('user-1')
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60)
  })
})

describe('hashString and compareHashed', () => {
  it('hashes a string so compareHashed confirms a match against the original and rejects anything else', async () => {
    const hashedPassword = await hashString('correct-password')

    expect(await compareHashed('correct-password', hashedPassword)).toBe(true)
    expect(await compareHashed('wrong-password', hashedPassword)).toBe(false)
  })
})

describe('hashToken', () => {
  it('deterministically hashes the same raw token to the same 64-character hex digest', () => {
    const firstDigest = hashToken('raw-session-token')
    const secondDigest = hashToken('raw-session-token')

    expect(firstDigest).toBe(secondDigest)
    expect(firstDigest).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces a different digest for a different raw token', () => {
    expect(hashToken('raw-session-token-a')).not.toBe(hashToken('raw-session-token-b'))
  })
})
