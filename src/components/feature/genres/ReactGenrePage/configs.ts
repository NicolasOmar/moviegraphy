import type { GenreFormModel } from '@ts-types/entities'
import type { FormConfig } from '@ts-types/forms'

export const genreFormTitle = 'Create new Genre'
export const genreFormInputs: FormConfig<GenreFormModel> = [
  {
    config: {
      label: 'Name',
      name: 'name',
      rules: [{ message: 'The name is required', required: true }, { max: 300 }],
      type: 'text'
    },
    type: 'input'
  }
]
