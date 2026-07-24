import type { InputType } from '@ts/types'
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
  const normalize =
    type === 'number' ? (value: string) => (value ? Number(value) : value) : undefined

  return (
    <Form.Item label={label} name={name} normalize={normalize} rules={rules}>
      <Input type={type} />
    </Form.Item>
  )
}

export default ReactFormInput
