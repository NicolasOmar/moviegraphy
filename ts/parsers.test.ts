import { describe, expect, it } from 'vitest'

import { movieMocks } from './mocks'
import { handleErrorMessage, parseFormDataToModel, parseModelToFormData } from './parsers'

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
      releaseYear: String(movie.releaseYear)
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

describe('handleErrorMessage', () => {
  it('extracts the message from an Error instance', () => {
    expect(handleErrorMessage(new Error('database connection failed'))).toBe(
      'database connection failed'
    )
  })

  it('coerces non-Error values to a string', () => {
    expect(handleErrorMessage('plain string failure')).toBe('plain string failure')
    expect(handleErrorMessage({ code: 500 })).toBe('[object Object]')
  })
})
