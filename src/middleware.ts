import { isSessionValid } from '@api/sessions'
import { PAGE_URL, SESSION_COOKIE_NAME } from '@ts/constants'
import { defineMiddleware } from 'astro:middleware'

const AUTH_EXEMPT_PAGE_URLS: string[] = [PAGE_URL.LOGIN, PAGE_URL.USERS_CREATE]

export const onRequest = defineMiddleware(async ({ cookies, redirect, url }, next) => {
  if (url.pathname.startsWith('/api')) {
    return next()
  }

  const rawToken = cookies.get(SESSION_COOKIE_NAME)?.value
  const hasValidToken = rawToken ? await isSessionValid(rawToken) : false
  const isAuthExemptPage = AUTH_EXEMPT_PAGE_URLS.includes(url.pathname)

  if (!hasValidToken && !isAuthExemptPage) {
    return redirect(PAGE_URL.LOGIN)
  }

  if (hasValidToken && isAuthExemptPage) {
    return redirect(PAGE_URL.HOME)
  }

  return next()
})
