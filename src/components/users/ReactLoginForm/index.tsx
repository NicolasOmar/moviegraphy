import type { UserLoginModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'

import ReactFormInput from '@components/shared/ReactFormInput'
import { addMessageToContext } from '@store/messages'
import { API_METHODS, API_URL, HTTP_STATUS, PAGE_URL } from '@ts/constants'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Flex, Form, Typography } from 'antd'
import { type FC, useMemo, useState } from 'react'

const userLoginInputs: FormInputList<UserLoginModel> = [
  {
    label: 'Username or Email',
    name: 'name',
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

export const ReactLoginForm: FC = () => {
  const [loginForm] = Form.useForm<UserLoginModel>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const memoizedInputs = useMemo(
    () =>
      userLoginInputs.map((_inputConfig, _inputIndex) => (
        <ReactFormInput isDisabled={isLoading} key={`user-form-${_inputIndex}`} {..._inputConfig} />
      )),
    [isLoading]
  )

  const handleSubmit = async (_loginFormData: UserLoginModel) => {
    setIsLoading(true)

    const userToLogin = parseModelToFormData(_loginFormData)

    const userCreateResponse = await fetch(API_URL.SESSIONS, {
      body: userToLogin,
      method: API_METHODS.POST
    })

    if (userCreateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(userCreateResponse)
      addMessageToContext({ content: errorMessage, type: 'error' })
    } else {
      loginForm.resetFields()
      addMessageToContext({ content: 'User logged', type: 'success' })
      window.location.href = PAGE_URL.USERS
    }

    setIsLoading(false)
  }

  return (
    <section>
      <Typography.Title>Welcome to Moviegraphy</Typography.Title>

      <Form form={loginForm} onFinish={handleSubmit}>
        {memoizedInputs}

        <Form.Item>
          <Flex gap="medium">
            <Button disabled={isLoading} htmlType="submit" type="primary">
              Log In
            </Button>
            <Button disabled={isLoading} htmlType="button" type="text">
              <a href={PAGE_URL.USERS_CREATE}>Sign Up</a>
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </section>
  )
}
