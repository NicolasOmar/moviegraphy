import type { UserLoginFormModel } from '@ts/entities'
import type { APIRoute } from 'astro'

import { loginUser, logoutUser } from '@api/sessions'
import { HTTP_STATUS, SESSION_COOKIE_NAME } from '@ts/constants'
import { parseHttpErrorToResponse, parseMessageToResponse, parseRequestToModel } from '@ts/parsers'

export const POST: APIRoute = async ({ cookies, request }) => {
  const loginFormModel = await parseRequestToModel<UserLoginFormModel>(request)

  try {
    const rawSessionToken = await loginUser(loginFormModel)

    cookies.set(SESSION_COOKIE_NAME, rawSessionToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: true
    })

    return parseMessageToResponse(true, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}

export const DELETE: APIRoute = async ({ cookies }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)

  if (!sessionToken) {
    return parseMessageToResponse('No token provided', HTTP_STATUS.BAD_REQUEST)
  }

  try {
    await logoutUser(sessionToken.value)
    cookies.delete(SESSION_COOKIE_NAME)

    return parseMessageToResponse(true, HTTP_STATUS.OK)
  } catch (error) {
    return parseHttpErrorToResponse(error)
  }
}
