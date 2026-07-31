import type { MiddlewareHandler } from 'astro'

export const defineMiddleware = (handler: MiddlewareHandler): MiddlewareHandler => handler
