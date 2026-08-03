import type { UserFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'

import ReactFormInput from '@components/shared/ReactFormInput'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import { API_METHODS, API_URL, HTTP_STATUS, PAGE_URL, USER_ERROR_MESSAGES } from '@ts/constants'
import { passwordsAreEqual } from '@ts/misc'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Flex, Form, Typography } from 'antd'
import { type FC, useMemo } from 'react'

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
      { max: 25, message: 'Password must be 25 characters as much' },
      formInstace => {
        return {
          validator: (_, passwordValue) => {
            const repeatedPassword = formInstace.getFieldValue('repeatPassword')
            const passwordMatch = passwordsAreEqual(repeatedPassword, passwordValue)

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
  {
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
            const passwordMatch = passwordsAreEqual(passwordValue, repeatPassword)

            if (passwordMatch) {
              return Promise.resolve()
            }

            return Promise.reject(USER_ERROR_MESSAGES.PASSWORD_MISMATCH)
          }
        }
      }
    ],
    type: 'password'
  }
]

export const ReactUserForm: FC = () => {
  const [userForm] = Form.useForm<UserFormModel>()
  const isSystemLoading = useStore($contextLoading)
  const memoizedInputs = useMemo(
    () =>
      formInputs.map((_inputConfig, _inputIndex) => (
        <ReactFormInput
          isDisabled={isSystemLoading}
          key={`user-form-${_inputIndex}`}
          {..._inputConfig}
        />
      )),
    [isSystemLoading]
  )

  const handleSubmit = async (_userFormDataModel: UserFormModel) => {
    setLoadingSystemState(true)

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

    setLoadingSystemState(false)
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
          <Flex gap="medium">
            <Button disabled={isSystemLoading} htmlType="submit">
              Create
            </Button>
            <Button disabled={isSystemLoading} htmlType="button" type="text">
              <a href={PAGE_URL.LOGIN}>Log In</a>
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </>
  )
}
