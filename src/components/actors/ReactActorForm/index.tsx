import type { GendersModel } from '@models'
import type { ActorFormModel } from '@ts/entities'
import type { FormConfig } from '@ts/types'

import { type FormButton, ReactForm } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading } from '@store/loading'
import { Form } from 'antd'
import { type FC, useMemo } from 'react'

interface ReactActorFormProps {
  genderList: GendersModel[]
}

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
  }
]

export const ReactActorForm: FC<ReactActorFormProps> = ({ genderList }) => {
  const isSystemLoading = useStore($contextLoading)
  const [actorForm] = Form.useForm<ActorFormModel>()

  const memoizedFormButtons = useMemo(() => {
    return [
      {
        htmlType: 'submit',
        title: 'Confirm',
        type: 'primary'
      } as FormButton
    ]
  }, [])
  const memoizedFormInputs = useMemo(() => {
    return actorFormInputs.map(_inputConfig => {
      return _inputConfig.config.name === 'genderId'
        ? {
            ..._inputConfig,
            config: {
              ..._inputConfig.config,
              options: genderList.map(_gender => ({ label: _gender.name, value: _gender.id }))
            }
          }
        : _inputConfig
    })
  }, [genderList])

  const handleSubmit = (_actorToSubmit: ActorFormModel) => {
    console.warn(_actorToSubmit)
  }

  const handleError = () => {
    console.error('Error')
  }

  return (
    <ReactForm
      formButtons={memoizedFormButtons}
      formInputs={memoizedFormInputs}
      formInstance={actorForm}
      formTitle={actorFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleError}
    />
  )
}
