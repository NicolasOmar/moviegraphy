import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { createHash } from 'node:crypto'

export const createToken = (userId: string) => {
  const token = jwt.sign({ userId }, import.meta.env.JWT_SECRET!, { expiresIn: '7d' })
  return token
}

export const hashString = async (_stringToHash: string) => {
  return await argon2.hash(_stringToHash)
}

export const compareHashed = async (rawString: string, hashedString: string) => {
  return await argon2.verify(hashedString, rawString)
}

/**
 * Deterministic hash for session tokens. Unlike `hashString` (argon2, salted,
 * non-deterministic, used for passwords), session tokens are already
 * high-entropy JWTs, so a stable digest is used instead to allow direct
 * equality lookups against the stored value.
 */
export const hashToken = (rawToken: string) => {
  return createHash('sha256').update(rawToken).digest('hex')
}

/**
 * Current moment rebuilt from its ISO 8601 UTC string representation, so dates
 * persisted to the database stay independent of the server's local timezone.
 */
export const getCurrentISODate = (): Date => new Date(new Date().toISOString())

/**
 * `Date` offset by the given number of days from an ISO 8601 UTC baseline,
 * used to derive dates (e.g. session expiry) without server-timezone drift.
 */
export const getISODateWithDaysOffset = (days: number): Date => {
  const isoNow = getCurrentISODate()
  return new Date(isoNow.getTime() + days * 24 * 60 * 60 * 1000)
}
