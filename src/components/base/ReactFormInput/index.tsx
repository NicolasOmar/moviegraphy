import type { FormInput } from '@ts-types/forms'

import { Form, Input } from 'antd'

export const ReactFormInput = <InputEntity,>({
  isDisabled = false,
  label,
  name,
  placeholder,
  rules,
  type = 'text'
}: FormInput<InputEntity>) => {
  const normalize =
    type === 'number' ? (value: string) => (value ? Number(value) : value) : undefined

  return (
    <Form.Item label={label} name={name as string} normalize={normalize} rules={rules}>
      <Input disabled={isDisabled} placeholder={placeholder} type={type} />
    </Form.Item>
  )
}
