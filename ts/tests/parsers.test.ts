import { HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { HttpError } from '@ts/types'
import { describe, expect, it, vi } from 'vitest'

import { movieMocks } from '../mocks'
import {
  getErrorMessage,
  parseApiErrorToHttpError,
  parseFormDataToModel,
  parseHttpErrorToResponse,
  parseMessageToResponse,
  parseModelToFormData,
  parseRequestToModel,
  parseResponseErrorToMessage
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

describe('getErrorMessage', () => {
  it('extracts the message from an Error instance', () => {
    expect(getErrorMessage(new Error('database connection failed'))).toBe(
      'database connection failed'
    )
  })

  it('coerces non-Error values to a string', () => {
    expect(getErrorMessage('plain string failure')).toBe('plain string failure')
    expect(getErrorMessage({ code: 500 })).toBe('[object Object]')
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
