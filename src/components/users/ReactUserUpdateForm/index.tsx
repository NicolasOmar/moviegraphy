import type { UserUpdateModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import { API_METHODS, API_URL, HTTP_STATUS } from '@ts/constants'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'

const updateFormTitle = 'Update user data'
const updateFormInputs: FormInputList<UserUpdateModel> = [
  {
    label: 'Name',
    name: 'name',
    rules: [{ max: 25, message: 'Name must be 25 characters as much' }]
  },
  {
    label: 'Username',
    name: 'username',
    rules: [
      { message: 'Username is required', required: true },
      { max: 50, message: 'Username must be 50 characters as much' }
    ]
  }
]
const updateFormButtons: ReactFormButtonProps[] = [
  { htmlType: 'submit', title: 'Update', type: 'primary' }
]

export const ReactUserUpdateForm: FC = () => {
  const [userUpdateForm] = Form.useForm<UserUpdateModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_userUpdateFormData: UserUpdateModel) => {
    setLoadingSystemState(true)

    const userToUpdate = parseModelToFormData(_userUpdateFormData)

    const userUpdateResponse = await fetch(API_URL.USERS, {
      body: userToUpdate,
      method: API_METHODS.PATCH
    })

    if (userUpdateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(userUpdateResponse)
      addMessageToContext({ content: errorMessage, type: 'error' })
    } else {
      addMessageToContext({ content: 'User correctly updated', type: 'success' })
    }

    setLoadingSystemState(false)
  }

  const handleInvalidation = () =>
    addMessageToContext({ content: 'Check the form messages', type: 'error' })

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
