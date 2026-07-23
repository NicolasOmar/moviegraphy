import type { InputType } from '@ts/misc'
import type { Rule } from 'antd/es/form'
import type { FC } from 'react'

import { Form, Input } from 'antd'

interface ReactInputProps {
  label?: string
  name: string
  rules?: Rule[]
  type?: InputType
}

const ReactFormInput: FC<ReactInputProps> = ({ label, name, rules, type = 'text' }) => {
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <Input type={type} />
    </Form.Item>
  )
}

export default ReactFormInput
