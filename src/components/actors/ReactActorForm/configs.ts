import type { ActorFormModel } from '@ts-types/entities'
import type { FormConfig } from '@ts-types/forms'

export const actorFormTitle = 'Create a new actor'
export const actorFormInputs: FormConfig<ActorFormModel> = [
  {
    config: {
      label: 'Name',
      name: 'name',
      rules: [
        { message: 'Name is required', required: true },
        { max: 100, message: 'Name must be between 2 and 100 characters', min: 2 }
      ]
    },
    type: 'input'
  },
  {
    config: {
      label: 'Lastname',
      name: 'lastName',
      rules: [
        { message: 'Lastname is required', required: true },
        { max: 100, message: 'Lastname must be between 2 and 100 characters', min: 2 }
      ]
    },
    type: 'input'
  },
  {
    config: {
      label: 'Born date',
      name: 'bornDate',
      rules: [{ message: 'Born date is required', required: true }]
    },
    type: 'date'
  },
  {
    config: {
      label: 'Passed date',
      name: 'deadDate'
    },
    type: 'date'
  },
  {
    config: {
      label: 'Gender',
      name: 'genderId',
      rules: [{ message: 'Gender is required', required: true }]
    },
    type: 'radio'
  },
  {
    config: {
      label: 'Countries',
      name: 'countries',
      rules: [{ message: 'Countries are required', required: true }]
    },
    type: 'select'
  }
]
