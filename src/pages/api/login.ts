import type { UserLoginModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { getUserByCredentials } from '@api/users'
import { HTTP_STATUS } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ cookies, request }) => {
  const loginModel = await parseRequestToModel<UserLoginModel>(request)

  try {
    const { token } = await getUserByCredentials(loginModel)

    cookies.set('refreshToken', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: true
    })

    return parseMessageToResponse({ success: true }, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}
