import type { LoginFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { loginUser, logoutUser } from '@api/sessions'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ cookies, request }) => {
  const loginFormModel = await parseRequestToModel<LoginFormModel>(request)

  try {
    const sessionToken = await loginUser(loginFormModel)

    cookies.set(SESSION_COOKIE_NAME, sessionToken, {
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
  const loggedToken = cookies.get(SESSION_COOKIE_NAME)

  if (!loggedToken) {
    return parseMessageToResponse('No token provided', HTTP_STATUS.BAD_REQUEST)
  }

  try {
    await logoutUser(loggedToken.value)
    cookies.delete(SESSION_COOKIE_NAME)

    return parseMessageToResponse({ success: true }, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}
