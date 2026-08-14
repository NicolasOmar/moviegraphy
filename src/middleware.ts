import type { CustomAstroLocals } from '@ts/entities'

import { isSessionValid } from '@api/sessions'
import { findUserBySession } from '@api/users'
import {
  API_METHODS,
  API_URLS,
  HTTP_STATUS,
  PAGE_URL,
  SESSION_COOKIE_NAME,
  USER_ERROR_MESSAGES
} from '@ts/constants'
import { parseMessageToResponse } from '@ts/parsers'
import { defineMiddleware } from 'astro:middleware'

const API_PATH = '/api'
const AUTH_EXEMPT_PAGE_URLS: string[] = [PAGE_URL.LOGIN, PAGE_URL.USERS_CREATE]
const AUTH_EXEMPT_API_URLS: string[] = [API_URLS.USERS, API_URLS.SESSIONS]

/** Query called each time a page or api is requested (is the same concept for Astro, a request)
 * - First, i collects the session token from user's cookies and looks if the session is valid
 * - If valid, it resolves the logged user's id once and stores it in `locals` for the rest of the request
 * - Then, if the request is an api call (using `API_PATH` as reference), it will go to another branch
 *  - If the session token is not valid and the url is not a login or user creation path
 *    - It will remove the session token and return an ApiRoute `Reponse` with `UNAUTHORIZED` HTTP error code
 *    - Else, it will continue the request as usual
 * - If is not an API call, it will look for valid paths for unauthorized access (user creation and login pages)
 *  - If the token is invalid and is not routing to one of the paths mentioned, redirected to login page with cookies deleted
 *  - If is valid and is routing to one of the paths mentioned, redirected to home page (because is already logged)
 * - Else, it continues the page request as usual
 */
export const onRequest = defineMiddleware(
  async ({ cookies, locals, redirect, request, url }, next) => {
    const rawSessionToken = cookies.get(SESSION_COOKIE_NAME)?.value
    const isValidSessionToken = await isSessionValid(rawSessionToken).catch(() => false)
    const loggedUserId =
      rawSessionToken && isValidSessionToken ? await findUserBySession(rawSessionToken) : null

    if (loggedUserId) {
      ;(locals as CustomAstroLocals).loggedUserId = loggedUserId
    }

    if (url.pathname.startsWith(API_PATH)) {
      const isLoginOrUserCreateEndpoint =
        AUTH_EXEMPT_API_URLS.includes(url.pathname) && request.method === API_METHODS.POST

      if (!isValidSessionToken && !isLoginOrUserCreateEndpoint) {
        cookies.delete(SESSION_COOKIE_NAME)
        return parseMessageToResponse(USER_ERROR_MESSAGES.SESSION_EXPIRED, HTTP_STATUS.UNAUTHORIZED)
      }

      return next()
    }

    const isAuthExemptPage = AUTH_EXEMPT_PAGE_URLS.includes(url.pathname)

    if (!isValidSessionToken && !isAuthExemptPage) {
      cookies.delete(SESSION_COOKIE_NAME)
      return redirect(PAGE_URL.LOGIN)
    }

    if (isValidSessionToken && isAuthExemptPage) {
      return redirect(PAGE_URL.HOME)
    }

    return next()
  }
)
