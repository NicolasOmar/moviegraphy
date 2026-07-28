import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export const createToken = (userId: string) => {
  const token = jwt.sign({ userId }, import.meta.env.JWT_SECRET!, { expiresIn: '7d' })
  return token
}

export const hashString = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}
