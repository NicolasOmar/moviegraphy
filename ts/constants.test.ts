import { describe, expect, it } from 'vitest'

import { API_METHODS, API_URL } from './constants'

describe('API_METHODS', () => {
  it('exposes the HTTP methods used by the movie API route', () => {
    expect(API_METHODS).toEqual({ DELETE: 'DELETE', PATCH: 'PATCH', POST: 'POST' })
  })
})

describe('API_URL', () => {
  it('builds the movies endpoint from the base route and entity name', () => {
    expect(API_URL.MOVIES).toBe('/api/movie')
  })
})
