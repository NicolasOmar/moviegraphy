import type { Rule } from 'antd/es/form'
import type { FC } from 'react'

import { Form, Input } from 'antd'

interface ReactInputProps {
  label?: string
  name: string
  rules?: Rule[]
}

const ReactFormInput: FC<ReactInputProps> = ({ label, name, rules }) => {
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <Input type={'text'} />
    </Form.Item>
  )
}

export default ReactFormInput
