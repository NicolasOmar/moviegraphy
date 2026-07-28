import { isRefreshTokenValid } from '@api/tokens'
import { PAGE_URL } from '@ts/constants'
import { defineMiddleware } from 'astro:middleware'

const AUTH_EXEMPT_PAGE_URLS: string[] = [PAGE_URL.LOGIN, PAGE_URL.USERS_CREATE]

export const onRequest = defineMiddleware(async ({ cookies, redirect, url }, next) => {
  if (url.pathname.startsWith('/api')) {
    return next()
  }

  const rawToken = cookies.get('refreshToken')?.value
  const hasValidToken = rawToken ? await isRefreshTokenValid(rawToken) : false
  const isAuthExemptPage = AUTH_EXEMPT_PAGE_URLS.includes(url.pathname)

  if (!hasValidToken && !isAuthExemptPage) {
    return redirect(PAGE_URL.LOGIN)
  }

  if (hasValidToken && isAuthExemptPage) {
    return redirect(PAGE_URL.MOVIES)
  }

  return next()
})
