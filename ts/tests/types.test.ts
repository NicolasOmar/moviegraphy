import { describe, expect, it } from 'vitest'

import { HttpError } from '../types/api'

describe('HttpError', () => {
  it('carries the given status and message, and identifies itself as an HttpError', () => {
    const error = new HttpError(409, 'A user with this email already exists')

    expect(error.status).toBe(409)
    expect(error.message).toBe('A user with this email already exists')
    expect(error.name).toBe('HttpError')
    expect(error).toBeInstanceOf(Error)
  })
})
