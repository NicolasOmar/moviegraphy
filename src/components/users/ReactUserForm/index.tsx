import type { UserModel } from '@models'
import type { FormInputList } from '@ts/misc'
import type { FC } from 'react'

import ReactFormInput from '@components/shared/ReactFormInput'
import { API_METHODS, API_URL } from '@ts/constants'
import { parseModelToFormData } from '@ts/parsers'
import { Button, Form } from 'antd'

export interface UserFormModel extends Omit<UserModel, 'id'> {
  repeatPassword: string
}

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

    await fetch(API_URL.USERS, {
      body: userToCreate,
      method: API_METHODS.POST
    })
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
