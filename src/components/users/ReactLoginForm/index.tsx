import type { UserFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'

import ReactFormInput from '@components/shared/ReactFormInput'
import { Button, Form, Typography } from 'antd'
import { type FC, useMemo, useState } from 'react'

const formInputs: FormInputList<UserFormModel> = [
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
  const [loginForm] = Form.useForm()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const memoizedInputs = useMemo(
    () =>
      formInputs.map((_inputConfig, _inputIndex) => (
        <ReactFormInput isDisabled={isLoading} key={`user-form-${_inputIndex}`} {..._inputConfig} />
      )),
    [isLoading]
  )

  const handleSubmit = () => setIsLoading(true)

  return (
    <section>
      <Typography.Title>Welcome to Moviegraphy</Typography.Title>

      <Form form={loginForm} onFinish={handleSubmit}>
        {memoizedInputs}

        <Form.Item>
          <Button disabled={isLoading} htmlType="button">
            <a href="/users">Sign Up</a>
          </Button>
          <Button disabled={isLoading} htmlType="submit">
            Log In
          </Button>
        </Form.Item>
      </Form>
    </section>
  )
}
