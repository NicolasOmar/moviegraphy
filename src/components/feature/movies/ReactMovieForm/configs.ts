import type { MovieFormModel } from '@ts-types/entities'
import type { FormConfig } from '@ts-types/forms'

export const movieFormTitle = 'Create a new movie'
export const movieFormInputs: FormConfig<MovieFormModel> = [
  {
    config: {
      label: 'Name',
      name: 'name',
      rules: [
        { message: 'Name is required', required: true },
        { max: 300, message: 'Name must be 150 characters as much' }
      ]
    },
    type: 'input'
  },
  {
    config: {
      label: 'Description',
      name: 'description',
      rules: [{ max: 300, message: 'Description must be 300 characters as much' }]
    },
    type: 'input'
  },
  {
    config: {
      label: 'Year of release',
      name: 'releaseYear',
      rules: [
        { message: 'Year of release is required', required: true },
        { max: 3000, min: 1850, type: 'number' }
      ],
      type: 'number'
    },
    type: 'input'
  },
  {
    config: {
      label: 'Country',
      name: 'countryMade',
      rules: [{ message: 'Country is required', required: true }]
    },
    type: 'input'
  }
]
