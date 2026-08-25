import type { FormInput } from '@ts/types'

import { DatePicker, Form } from 'antd'

export const ReactFormDatePicker = <InputEntity,>({
  isDisabled = false,
  label,
  name,
  placeholder,
  rules
}: FormInput<InputEntity>) => {
  return (
    <Form.Item label={label} name={name as string} rules={rules}>
      <DatePicker disabled={isDisabled} placeholder={placeholder} />
    </Form.Item>
  )
}
