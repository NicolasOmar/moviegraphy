import type { UserUpdateFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import { Form } from 'antd'

const updateFormTitle = 'Update user data'
const updateFormInputs: FormInputList<UserUpdateFormModel> = [
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
  const [userUpdateForm] = Form.useForm<UserUpdateFormModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = (_formData: UserUpdateFormModel) => console.warn(_formData)

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
