import type { PasswordChangeModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import { API_METHODS, API_URL, HTTP_STATUS } from '@ts/constants'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'

const title = 'Change password'
const formInputs: FormInputList<PasswordChangeModel> = [
  {
    label: 'Old password',
    name: 'old',
    rules: [
      { message: 'The password is required', required: true },
      { message: 'Password must have minimun 4 characters', min: 4 },
      { max: 25, message: 'The password must be 25 characters as much' }
    ],
    type: 'password'
  },
  {
    label: 'New password',
    name: 'new',
    rules: [
      { message: 'The password is required', required: true },
      { message: 'Password must have minimun 4 characters', min: 4 },
      { max: 25, message: 'The password must be 25 characters as much' }
    ],
    type: 'password'
  },
  {
    label: 'Repeat new password',
    name: 'repeatNew',
    rules: [
      { message: 'The password is required', required: true },
      { message: 'Password must have minimun 4 characters', min: 4 },
      { max: 25, message: 'The password must be 25 characters as much' }
    ],
    type: 'password'
  }
]

export const ReactPasswordForm: FC = () => {
  const [passwordForm] = Form.useForm<PasswordChangeModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_formData: PasswordChangeModel) => {
    setLoadingSystemState(true)

    const passwordToUpdate = parseModelToFormData(_formData)

    const passwordUpdateResponse = await fetch(API_URL.PASSWORDS, {
      body: passwordToUpdate,
      method: API_METHODS.POST
    })

    if (passwordUpdateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(passwordUpdateResponse)
      addMessageToContext({ content: errorMessage, type: 'error' })
    } else {
      passwordForm.resetFields()
      addMessageToContext({ content: 'Password updated', type: 'success' })
    }

    setLoadingSystemState(false)
    return null
  }

  const handleInvalidation = () =>
    addMessageToContext({ content: 'Check the form messages', type: 'error' })

  return (
    <ReactForm
      formButtons={[{ htmlType: 'submit', title: 'Update', type: 'primary' }]}
      formInputs={formInputs}
      formInstance={passwordForm}
      formTitle={title}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
