import type { FormInputType } from '@ts/types'
import type { Rule } from 'antd/es/form'
import type { FC } from 'react'

import { Form, Input } from 'antd'

interface ReactInputProps {
  isDisabled?: boolean
  label?: string
  name: string
  rules?: Rule[]
  type?: FormInputType
}

export const ReactFormInput: FC<ReactInputProps> = ({
  isDisabled = false,
  label,
  name,
  rules,
  type = 'text'
}) => {
  const normalize =
    type === 'number' ? (value: string) => (value ? Number(value) : value) : undefined

  return (
    <Form.Item label={label} name={name} normalize={normalize} rules={rules}>
      <Input disabled={isDisabled} type={type} />
    </Form.Item>
  )
}
