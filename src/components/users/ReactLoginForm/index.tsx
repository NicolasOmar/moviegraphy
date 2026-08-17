import type { UserLoginFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS, PAGE_URL } from '@ts/constants'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'
import { type FC } from 'react'

const loginFormTitle = 'Welcome to Moviegraphy'
const loginFormInputs: FormInputList<UserLoginFormModel> = [
  {
    label: 'Username or Email',
    name: 'username',
    rules: [{ message: 'Username or Email is required', required: true }]
  },
  {
    label: 'Password',
    name: 'password',
    rules: [
      { message: 'Password is required', required: true },
      { message: 'Password must have minimun 4 characters', min: 4 },
      { max: 25, message: 'Password must be 25 characters as much' }
    ],
    type: 'password'
  }
]
const loginFormButtons: ReactFormButtonProps[] = [
  { htmlType: 'submit', title: 'Log In', type: 'primary' },
  { children: <a href={PAGE_URL.USERS_CREATE}>Sign Up</a>, htmlType: 'submit', type: 'text' }
]

export const ReactLoginForm: FC = () => {
  const [loginForm] = Form.useForm<UserLoginFormModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_loginFormData: UserLoginFormModel) => {
    setLoadingSystemState(true)

    const userToLogin = parseModelToFormData(_loginFormData)

    const userCreateResponse = await fetch(API_URLS.SESSIONS, {
      body: userToLogin,
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

  return (
    <ReactForm
      formButtons={loginFormButtons}
      formInputs={loginFormInputs}
      formInstance={loginForm}
      formTitle={loginFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
    />
  )
}
