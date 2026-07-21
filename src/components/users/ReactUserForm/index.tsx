import type { UserFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/misc'
import type { FC } from 'react'

import ReactFormInput from '@components/shared/ReactFormInput'
import { addMessageToContext } from '@store/message'
import { API_METHODS, API_URL } from '@ts/constants'
import { parseModelToFormData } from '@ts/parsers'
import { Button, Form } from 'antd'

const formInputs: FormInputList<UserFormModel> = [
  { label: 'Username', name: 'name' },
  { label: 'Email', name: 'email' },
  { label: 'Password', name: 'password' },
  { label: 'Repeat Password', name: 'repeatPassword' }
]

export const ReactUserForm: FC = () => {
  const [userForm] = Form.useForm<UserFormModel>()

  const handleSubmit = async (_userFormDataModel: UserFormModel) => {
    const userToCreate = parseModelToFormData(_userFormDataModel)

    const { status, statusText } = await fetch(API_URL.USERS, {
      body: userToCreate,
      method: API_METHODS.POST
    })

    if (status === 500) {
      addMessageToContext(statusText)
    }
  }

  return (
    <Form form={userForm} onFinish={handleSubmit} style={{ padding: '0 5%' }}>
      {formInputs.map((_inputConfig, _index) => (
        <ReactFormInput key={`user-form-${_index}`} {..._inputConfig} />
      ))}

      <Form.Item>
        <Button htmlType="submit">Create</Button>
      </Form.Item>
    </Form>
  )
}
