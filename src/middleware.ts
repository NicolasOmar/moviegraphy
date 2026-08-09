import { isSessionValid } from '@api/sessions'
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

export const onRequest = defineMiddleware(async ({ cookies, redirect, request, url }, next) => {
  const rawToken = cookies.get(SESSION_COOKIE_NAME)?.value
  const hasValidToken = await isSessionValid(rawToken)

  if (url.pathname.startsWith(API_PATH)) {
    const isLoginOrUserCreateEndpoint =
      AUTH_EXEMPT_API_URLS.includes(url.pathname) && request.method === API_METHODS.POST

    if (!hasValidToken && !isLoginOrUserCreateEndpoint) {
      cookies.delete(SESSION_COOKIE_NAME)
      return parseMessageToResponse(USER_ERROR_MESSAGES.SESSION_EXPIRED, HTTP_STATUS.UNAUTHORIZED)
    }

    return next()
  }

  const isAuthExemptPage = AUTH_EXEMPT_PAGE_URLS.includes(url.pathname)

  if (!hasValidToken && !isAuthExemptPage) {
    cookies.delete(SESSION_COOKIE_NAME)
    return redirect(PAGE_URL.LOGIN)
  }

  if (hasValidToken && isAuthExemptPage) {
    return redirect(PAGE_URL.HOME)
  }

  return next()
})
