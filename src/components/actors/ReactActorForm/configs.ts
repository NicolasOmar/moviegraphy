import type { ActorFormModel } from '@ts/entities'
import type { FormConfig } from '@ts/types'

export const actorFormTitle = 'Create a new actor'
export const actorFormInputs: FormConfig<ActorFormModel> = [
  {
    config: {
      label: 'Name',
      name: 'name'
    },
    type: 'input'
  },
  {
    config: {
      label: 'Lastname',
      name: 'lastName'
    },
    type: 'input'
  },
  {
    config: {
      label: 'Born date',
      name: 'bornDate'
    },
    type: 'input'
  },
  {
    config: {
      label: 'Passed date',
      name: 'deadDate'
    },
    type: 'input'
  },
  {
    config: {
      label: 'Gender',
      name: 'genderId'
    },
    type: 'radio'
  },
  {
    config: {
      label: 'Countries',
      name: 'countries'
    },
    type: 'select'
  }
]
