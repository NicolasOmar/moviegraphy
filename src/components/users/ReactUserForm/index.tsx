import type { UserFormModel } from '@ts-types/entities'
import type { FormConfig } from '@ts-types/forms'

import { type FormButton, ReactForm } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS, PAGE_URL, USER_ERROR_MESSAGES } from '@ts/constants'
import { arePassworsEqual } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'
import { type FC } from 'react'

const userFormTitle = 'Sign up'
const userFormInputs: FormConfig<UserFormModel> = [
  {
    config: {
      label: 'Name',
      name: 'name',
      rules: [{ max: 25, message: 'Name must be 25 characters as much' }]
    },
    type: 'input'
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
    type: 'input'
  },
  {
    config: {
      label: 'Email',
      name: 'email',
      rules: [
        { message: 'Email is required', required: true },
        { message: 'Please, provide a correct email format', type: 'email' },
        { max: 50, message: 'Email must be 50 characters as much' }
      ]
    },
    type: 'input'
  },
  {
    config: {
      label: 'Password',
      name: 'password',
      rules: [
        { message: 'Password is required', required: true },
        { message: 'Password must have minimun 4 characters', min: 4 },
        { max: 25, message: 'Password must be 25 characters as much' },
        formInstace => {
          return {
            validator: (_, passwordValue) => {
              const repeatedPassword = formInstace.getFieldValue('repeatPassword')
              const passwordMatch = arePassworsEqual(repeatedPassword, passwordValue)

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
      label: 'Repeat Password',
      name: 'repeatPassword',
      rules: [
        { message: 'Repeat Password is required', required: true },
        { message: 'Repeat Password must have minimun 4 characters', min: 4 },
        { max: 25, message: 'Repeat Password must be 25 characters as much' },
        formInstace => {
          return {
            validator: (_, repeatPassword) => {
              const passwordValue = formInstace.getFieldValue('password')
              const passwordMatch = arePassworsEqual(passwordValue, repeatPassword)

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
const userFormButtons: FormButton[] = [
  { htmlType: 'submit', title: 'Create', type: 'primary' },
  { children: <a href="/login">Log In</a>, htmlType: 'button', type: 'text' }
]

export const ReactUserForm: FC = () => {
  const [userForm] = Form.useForm<UserFormModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_userFormDataModel: UserFormModel) => {
    setLoadingSystemState(true)

    const userToCreate = parseModelToFormData(_userFormDataModel)

    const userCreateResponse = await fetch(API_URLS.USERS, {
      body: userToCreate,
      method: API_METHODS.POST
    })

    if (userCreateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(userCreateResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      window.location.href = PAGE_URL.HOME
    }

    setLoadingSystemState(false)
  }

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  return (
    <ReactForm
      formButtons={userFormButtons}
      formInputs={userFormInputs}
      formInstance={userForm}
      formTitle={userFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
