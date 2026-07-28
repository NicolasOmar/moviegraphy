import type { UserLoginModel, UserWithToken } from '@ts/entities'
import type { APIRoute } from 'astro'

import { loginUser, logoutUser } from '@api/sessions'
import { HTTP_STATUS } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ cookies, request }) => {
  const loginModel = await parseRequestToModel<UserLoginModel>(request)

  try {
    const { token } = (await loginUser(loginModel)) as UserWithToken

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

export const DELETE: APIRoute = async ({ cookies }) => {
  const loggedToken = cookies.get('refreshToken')

  if (loggedToken) {
    await logoutUser(loggedToken?.value)

    try {
      cookies.delete('refreshToken')
      return parseMessageToResponse({ success: true }, HTTP_STATUS.OK)
    } catch (error) {
      return parseHttpErrorToResponse(error)
    }
  }

  return parseHttpErrorToResponse({
    message: 'No token provided',
    status: HTTP_STATUS.BAD_REQUEST
  })
}
