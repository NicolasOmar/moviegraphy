import type { PasswordUpdateFormModel } from '@ts-types/entities'
import type { FormConfig } from '@ts-types/forms'
import type { FC } from 'react'

import { type FormButton, ReactForm } from '@base-components/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS, USER_ERROR_MESSAGES } from '@ts/constants'
import { arePassworsEqual, fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'

const passwordChangeTitle = 'Change password'
const passwordChangeInputs: FormConfig<PasswordUpdateFormModel> = [
  {
    config: {
      label: 'Old password',
      name: 'old',
      rules: [
        { message: 'The password is required', required: true },
        { message: 'Password must have minimun 4 characters', min: 4 },
        { max: 25, message: 'The password must be 25 characters as much' }
      ],
      type: 'password'
    },
    type: 'input'
  },
  {
    config: {
      label: 'New password',
      name: 'new',
      rules: [
        { message: 'The password is required', required: true },
        { message: 'Password must have minimun 4 characters', min: 4 },
        { max: 25, message: 'The password must be 25 characters as much' },
        formInstace => {
          return {
            validator: (_, newPassword) => {
              const repeatNewValue = formInstace.getFieldValue('repeatNew')
              const passwordMatch = arePassworsEqual(repeatNewValue, newPassword)

              if (passwordMatch) {
                return Promise.resolve()
              }

              return Promise.reject(USER_ERROR_MESSAGES.PASSWORD_MISMATCH)
            }
          }
        }
      ],
      type: 'password'
    },
    type: 'input'
  },
  {
    config: {
      label: 'Repeat new password',
      name: 'repeatNew',
      rules: [
        { message: 'The password is required', required: true },
        { message: 'Password must have minimun 4 characters', min: 4 },
        { max: 25, message: 'The password must be 25 characters as much' },
        formInstace => {
          return {
            validator: (_, repeatedPassword) => {
              const firstNewPassword = formInstace.getFieldValue('new')
              const passwordMatch = arePassworsEqual(firstNewPassword, repeatedPassword)

              if (passwordMatch) {
                return Promise.resolve()
              }

              return Promise.reject(USER_ERROR_MESSAGES.PASSWORD_MISMATCH)
            }
          }
        }
      ],
      type: 'password'
    },
    type: 'input'
  }
]
const passwordChangeButtons: FormButton[] = [
  { htmlType: 'submit', title: 'Update', type: 'primary' }
]

export const ReactPasswordForm: FC = () => {
  const [passwordForm] = Form.useForm<PasswordUpdateFormModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_formData: PasswordUpdateFormModel) => {
    setLoadingSystemState(true)

    const passwordToUpdate = parseModelToFormData(_formData)

    const passwordUpdateResponse = await fetchWithAuth(API_URLS.PASSWORDS, {
      body: passwordToUpdate,
      method: API_METHODS.POST
    })

    if (passwordUpdateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(passwordUpdateResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      passwordForm.resetFields()
      publishNotification({ content: 'Password updated', type: 'success' })
    }

    setLoadingSystemState(false)
    return null
  }

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  return (
    <ReactForm
      formButtons={passwordChangeButtons}
      formInputs={passwordChangeInputs}
      formInstance={passwordForm}
      formTitle={passwordChangeTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
