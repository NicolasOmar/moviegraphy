import type { UserUpdateFormModel } from '@ts/entities'
import type { FormConfig } from '@ts/types'
import type { FC } from 'react'

import { type FormButton, ReactForm } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'

const updateFormTitle = 'Update user data'
const updateFormInputs: FormConfig<UserUpdateFormModel> = [
  {
    config: {
      label: 'Name',
      name: 'name',
      rules: [{ max: 25, message: 'Name must be 25 characters as much' }]
    },
    typeOfInput: 'input'
  },
  {
    config: {
      label: 'Username',
      name: 'username',
      rules: [
        { message: 'Username is required', required: true },
        { max: 50, message: 'Username must be 50 characters as much' }
      ]
    },
    typeOfInput: 'input'
  }
]
const updateFormButtons: FormButton[] = [{ htmlType: 'submit', title: 'Update', type: 'primary' }]

export const ReactUserUpdateForm: FC = () => {
  const [userUpdateForm] = Form.useForm<UserUpdateFormModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_userUpdateFormData: UserUpdateFormModel) => {
    setLoadingSystemState(true)

    const userToUpdate = parseModelToFormData(_userUpdateFormData)

    const userUpdateResponse = await fetchWithAuth(API_URLS.USERS, {
      body: userToUpdate,
      method: API_METHODS.PATCH
    })

    if (userUpdateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(userUpdateResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      publishNotification({ content: 'User correctly updated', type: 'success' })
    }

    setLoadingSystemState(false)
  }

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  return (
    <ReactForm
      formButtons={updateFormButtons}
      formInputs={updateFormInputs}
      formInstance={userUpdateForm}
      formTitle={updateFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
