import { HttpError } from '@ts-types/api'
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { describe, expect, it, vi } from 'vitest'

import { movieMocks } from '../mocks'
import {
  parseApiErrorToHttpError,
  parseFormDataToModel,
  parseHttpErrorToResponse,
  parseIdStringToArray,
  parseMessageToResponse,
  parseModelToFormData,
  parseRequestToModel,
  parseResponseErrorToMessage,
  parseValueToIsoDate
} from '../parsers'

describe('parseModelToFormData', () => {
  it('serializes every field of the given model into string-coerced FormData entries', () => {
    const [movie] = movieMocks

    const formData = parseModelToFormData(movie)

    expect(formData.get('id')).toBe(movie.id)
    expect(formData.get('name')).toBe(movie.name)
    expect(formData.get('description')).toBe(movie.description)
    expect(formData.get('countryMade')).toBe(movie.countryMade)
    expect(formData.get('releaseYear')).toBe(String(movie.releaseYear))
  })
})

describe('parseFormDataToModel', () => {
  it('round-trips a model through FormData back into a plain object with string values', () => {
    const [movie] = movieMocks
    const formData = parseModelToFormData(movie)

    const parsedModel = parseFormDataToModel<Record<string, string>>(formData)

    expect(parsedModel).toEqual({
      countryMade: movie.countryMade,
      description: movie.description,
      id: movie.id,
      name: movie.name,
      releaseYear: String(movie.releaseYear),
      userId: movie.userId
    })
  })

  it('keeps only the last value when a key appears more than once in the FormData', () => {
    const formData = new FormData()
    formData.append('name', 'The Matrix')
    formData.append('name', 'The Matrix Reloaded')

    const parsedModel = parseFormDataToModel<{ name: string }>(formData)

    expect(parsedModel).toEqual({ name: 'The Matrix Reloaded' })
  })
})

describe('parseRequestToModel', () => {
  it('extracts the request formData body into a plain model object', async () => {
    const [movie] = movieMocks
    const formData = parseModelToFormData(movie)
    const request = new Request('http://localhost/api/movies', { body: formData, method: 'POST' })

    const parsedModel = await parseRequestToModel<Record<string, string>>(request)

    expect(parsedModel).toEqual({
      countryMade: movie.countryMade,
      description: movie.description,
      id: movie.id,
      name: movie.name,
      releaseYear: String(movie.releaseYear),
      userId: movie.userId
    })
  })
})

describe('parseIdStringToArray', () => {
  it('splits a comma-separated string into its individual ids', () => {
    expect(parseIdStringToArray('genre-1,genre-2')).toEqual(['genre-1', 'genre-2'])
  })

  it('returns an array unchanged, aside from dropping empty entries', () => {
    expect(parseIdStringToArray(['genre-1', '', 'genre-2'])).toEqual(['genre-1', 'genre-2'])
  })

  it('returns an empty array for an empty string instead of a bogus single id', () => {
    expect(parseIdStringToArray('')).toEqual([])
  })

  it('splits using a custom separator when one is provided', () => {
    expect(parseIdStringToArray('country-1|country-2', '|')).toEqual(['country-1', 'country-2'])
  })
})

describe('parseResponseErrorToMessage', () => {
  it('returns the message as-is when the response body carries a single string', async () => {
    const response = new Response(JSON.stringify({ message: 'Name is required' }))

    expect(await parseResponseErrorToMessage(response)).toBe('Name is required')
  })

  it('joins the messages with ". " when the response body carries an array', async () => {
    const response = new Response(
      JSON.stringify({ message: ['Name is required', 'Email is invalid'] })
    )

    expect(await parseResponseErrorToMessage(response)).toBe('Name is required. Email is invalid')
  })
})

describe('parseMessageToResponse', () => {
  it('wraps the given message and status into a Response with a JSON body', async () => {
    const response = parseMessageToResponse('Movie created', HTTP_STATUS.OK)

    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(await response.json()).toEqual({ message: 'Movie created' })
  })
})

describe('parseApiErrorToHttpError', () => {
  it('logs the error under the given api path and returns it unchanged when it is already an HttpError', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const originalError = new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)

    const result = parseApiErrorToHttpError(originalError, '[POST /api/users]')

    expect(result).toBe(originalError)
    expect(consoleErrorSpy).toHaveBeenCalledWith('[POST /api/users]', { error: originalError })
  })

  it('wraps an Error instance into a 500 HttpError carrying its message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const originalError = new Error('unique constraint failed')

    const result = parseApiErrorToHttpError(originalError, '[POST /api/movies]')

    expect(result).toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed')
    )
  })

  it('wraps a non-Error value into a 500 HttpError with the stringified value', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const result = parseApiErrorToHttpError('connection refused', '[GET /api/genres]')

    expect(result).toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused'))
  })
})

describe('parseHttpErrorToResponse', () => {
  it('carries the status and message of an HttpError over to the Response', async () => {
    const response = parseHttpErrorToResponse(
      new HttpError(HTTP_STATUS.CONFLICT, USER_ERROR_MESSAGES.DUPLICATE_EMAIL)
    )

    expect(response.status).toBe(HTTP_STATUS.CONFLICT)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.DUPLICATE_EMAIL })
  })

  it('masks any non-HttpError value behind a generic 500 response', async () => {
    const response = parseHttpErrorToResponse(new Error('unexpected failure'))

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(await response.json()).toEqual({ message: USER_ERROR_MESSAGES.UNEXPECTED })
  })
})

describe('parseValueToIsoDate', () => {
  it('rebuilds a Date instance through an ISO round-trip', () => {
    const original = new Date('2024-01-15T10:30:00.000Z')

    const result = parseValueToIsoDate(original)

    expect(result.toISOString()).toBe(original.toISOString())
  })

  it('parses a date string into a Date matching its ISO representation', () => {
    const result = parseValueToIsoDate('2024-01-15')

    expect(result.toISOString()).toBe(new Date('2024-01-15').toISOString())
  })

  it('parses a timestamp number into a Date matching its ISO representation', () => {
    const timestamp = 1705315800000

    const result = parseValueToIsoDate(timestamp)

    expect(result.toISOString()).toBe(new Date(timestamp).toISOString())
  })
})
