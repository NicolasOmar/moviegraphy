import type { ActorsModel, CountriesModel, GendersModel } from '@models'
import type { ActorFormModel } from '@ts/types/entities'
import type { FormHookProps } from '@ts/types/forms'

import { actorFormInputs, actorFormTitle } from '@feature-components/actors/ReactActorsPage/configs'
import { useStore } from '@nanostores/react'
import { $globalLoading } from '@store/loading'
import { callFormModal } from '@store/modals'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import {
  parseModelToFormData,
  parseResponseErrorToMessage,
  parseResponseMessageToEntity
} from '@ts/parsers'
import { Form } from 'antd'
import { useMemo } from 'react'

interface ReactActorFormProps {
  countryList: CountriesModel[]
  genderList: GendersModel[]
}

export const useActorForm = ({
  countryList,
  genderList
}: ReactActorFormProps): FormHookProps<ActorsModel> => {
  const isSystemLoading = useStore($globalLoading)
  const [actorForm] = Form.useForm<ActorFormModel>()

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

  const handleFailedActorSubmit = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  const handleActorCreate = async (_actorToSubmit: ActorFormModel) => {
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

  const invokeActorForm = () => {
    callFormModal({
      form: {
        formInputs: memoizedFormInputs,
        formInstance: actorForm,
        formTitle: actorFormTitle,
        isLoading: isSystemLoading,
        onSubmit: handleActorCreate,
        onSubmitFailed: handleFailedActorSubmit
      }
    })
  }

  const handleActorDelete = (_actorToDelete: ActorsModel) => console.warn(_actorToDelete)

  const handleActorUpdate = (_actorToUpdate: ActorsModel) => console.error(_actorToUpdate)

  return {
    handleCreate: invokeActorForm,
    handleDelete: handleActorUpdate,
    handleUpdate: handleActorDelete,
    isLoading: isSystemLoading
  }
}
