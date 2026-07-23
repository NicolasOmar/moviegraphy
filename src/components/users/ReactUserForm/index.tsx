import type { UserFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/misc'
import type { FC } from 'react'

import ReactFormInput from '@components/shared/ReactFormInput'
import { addMessageToContext } from '@store/message'
import { API_METHODS, API_URL, HTTP_STATUS } from '@ts/constants'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Form, Typography } from 'antd'

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
      { message: 'Please, provide a correct email format', type: 'email' }
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

  const handleSubmit = async (_userFormDataModel: UserFormModel) => {
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
        {formInputs.map((_inputConfig, _index) => (
          <ReactFormInput key={`user-form-${_index}`} {..._inputConfig} />
        ))}

        <Form.Item>
          <Button htmlType="submit">Create</Button>
        </Form.Item>
      </Form>
    </>
  )
}
