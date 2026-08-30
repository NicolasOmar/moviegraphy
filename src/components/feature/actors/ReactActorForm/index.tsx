import type { ActorsModel, CountriesModel, GendersModel } from '@models'
import type { ActorFormModel } from '@ts-types/entities'

import { type FormButtonProps, ReactForm } from '@base-components/ReactForm'
import { useStore } from '@nanostores/react'
import { $globalLoading } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import {
  parseModelToFormData,
  parseResponseErrorToMessage,
  parseResponseMessageToEntity
} from '@ts/parsers'
import { Form } from 'antd'
import { type FC, useMemo } from 'react'

import { actorFormInputs, actorFormTitle } from './configs'

interface ReactActorFormProps {
  countryList: CountriesModel[]
  genderList: GendersModel[]
}

export const ReactActorForm: FC<ReactActorFormProps> = ({ countryList, genderList }) => {
  const isSystemLoading = useStore($globalLoading)
  const [actorForm] = Form.useForm<ActorFormModel>()

  const memoizedFormButtons = useMemo(() => {
    return [
      {
        htmlType: 'submit',
        title: 'Confirm',
        type: 'primary'
      } as FormButtonProps
    ]
  }, [])
  const memoizedFormInputs = useMemo(() => {
    const parsedInputConfig = actorFormInputs.map(_inputConfig => {
      switch (_inputConfig.config.name) {
        case 'countries':
          return {
            ..._inputConfig,
            config: {
              ..._inputConfig.config,
              options: countryList.map(_country => ({ label: _country.name, value: _country.id }))
            }
          }
        case 'genderId':
          return {
            ..._inputConfig,
            config: {
              ..._inputConfig.config,
              options: genderList.map(_gender => ({ label: _gender.name, value: _gender.id }))
            }
          }
        default:
          return _inputConfig
      }
    })

    return parsedInputConfig
  }, [genderList, countryList])

  const handleSubmit = async (_actorToSubmit: ActorFormModel) => {
    const actorFormData = parseModelToFormData({
      ..._actorToSubmit,
      deadDate: _actorToSubmit.deadDate ?? null
    })
    const actorCreateResponse = await fetchWithAuth(API_URLS.ACTORS, {
      body: actorFormData,
      method: API_METHODS.POST
    })

    if (actorCreateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(actorCreateResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      await parseResponseMessageToEntity<ActorsModel>(actorCreateResponse)

      publishNotification({ content: 'Actor created', type: 'success' })
    }
  }

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  return (
    <ReactForm
      formButtons={memoizedFormButtons}
      formInputs={memoizedFormInputs}
      formInstance={actorForm}
      formTitle={actorFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
