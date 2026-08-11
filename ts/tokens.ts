import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { createHash } from 'node:crypto'

/**
 * Generator of JWT tokens for session login based on users's id
 *
 * @param _userId The base string to create a new JWT token
 * @returns a new JWT token
 */
export const createToken = (_userId: string) => {
  const newToken = jwt.sign({ _userId }, import.meta.env.JWT_SECRET!, { expiresIn: '7d' })
  return newToken
}

/**
 * String hahser using `argon2` library (mostly used for passwords here)
 *
 * @param _stringToHash Any type of string to be hashed
 * @returns A string of shape of a Promise
 */
export const hashString = async (_stringToHash: string) => {
  return await argon2.hash(_stringToHash)
}

/**
 * String comparisson between a non hashed string and its hashed counterpart
 *
 * @param _rawString The string without hashing to be compared
 * @param _hashedString The hashed string to use for comparisson
 * @returns A boolean that marks if the strings are equal or not
 */
export const compareHashed = async (_rawString: string, _hashedString: string) => {
  return await argon2.verify(_hashedString, _rawString)
}

/**
 * Deterministic hash for session tokens.
 * It does not use `hashString` (argon2, salted, non-deterministic, used for passwords), due
 * tokens are already high-entropy JWTs, so a stable digest is used instead to allow direct
 * equality lookups against the stored value.
 *
 * @param _rawToken A raw session token in string
 * @returns The hashed token in string
 */
export const hashToken = (_rawToken: string) => {
  return createHash('sha256').update(_rawToken).digest('hex')
}
