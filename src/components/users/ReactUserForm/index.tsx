import type { UserFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'

import ReactFormInput from '@components/shared/ReactFormInput'
import { addMessageToContext } from '@store/message'
import { API_METHODS, API_URL, HTTP_STATUS } from '@ts/constants'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Form, Typography } from 'antd'
import { type FC, useMemo, useState } from 'react'

const formInputs: FormInputList<UserFormModel> = [
  {
    label: 'Username',
    name: 'name',
    rules: [
      { message: 'Username is required', required: true },
      { max: 25, message: 'Username must be 25 characters as much' }
    ]
  },
  {
    label: 'Email',
    name: 'email',
    rules: [
      { message: 'Email is required', required: true },
      { message: 'Please, provide a correct email format', type: 'email' },
      { max: 50, message: 'Email must be 50 characters as much' }
    ]
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
  },
  {
    label: 'Repeat Password',
    name: 'repeatPassword',
    rules: [
      { message: 'Repeat Password is required', required: true },
      { message: 'Repeat Password must have minimun 4 characters', min: 4 },
      { max: 25, message: 'Repeat Password must be 25 characters as much' }
    ],
    type: 'password'
  }
]

export const ReactUserForm: FC = () => {
  const [userForm] = Form.useForm<UserFormModel>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const memoizedInputs = useMemo(
    () =>
      formInputs.map((_inputConfig, _inputIndex) => (
        <ReactFormInput isDisabled={isLoading} key={`user-form-${_inputIndex}`} {..._inputConfig} />
      )),
    [isLoading]
  )

  const handleSubmit = async (_userFormDataModel: UserFormModel) => {
    setIsLoading(true)

    const userToCreate = parseModelToFormData(_userFormDataModel)

    const userCreateResponse = await fetch(API_URL.USERS, {
      body: userToCreate,
      method: API_METHODS.POST
    })

    if (userCreateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(userCreateResponse)
      addMessageToContext({ content: errorMessage, type: 'error' })
    } else {
      userForm.resetFields()
      addMessageToContext({ content: 'User created', type: 'success' })
    }

    setIsLoading(false)
  }

  const handleInvalidation = () =>
    addMessageToContext({ content: 'Check the form messages', type: 'error' })

  return (
    <>
      <Typography.Title style={{ textAlign: 'center' }}>
        Welcome to the User section
      </Typography.Title>

      <Form
        form={userForm}
        onFinish={handleSubmit}
        onFinishFailed={handleInvalidation}
        style={{ padding: '0 5%' }}
      >
        {memoizedInputs}

        <Form.Item>
          <Button disabled={isLoading} htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
