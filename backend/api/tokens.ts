import { hashToken } from '@ts/helpers'
import { handleErrorMessage } from '@ts/parsers'

import prismaInstance from '../prisma'

export const isRefreshTokenValid = async (rawToken: string): Promise<boolean> => {
  try {
    const hashedToken = hashToken(rawToken)
    const refreshToken = await prismaInstance.sessions.findFirst({
      where: { expiresAt: { gt: new Date() }, token: hashedToken }
    })

    return Boolean(refreshToken)
  } catch (error) {
    const errorMessage = handleErrorMessage(error)

    console.error('[middleware] refresh token validation failed', { errorMessage })

    return false
  }
}
