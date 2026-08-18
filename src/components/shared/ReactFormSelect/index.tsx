import type { FormSelect } from '@ts/types'

import { Form, Select } from 'antd'

export const ReactFormSelect = <T,>({
  isDisabled,
  label,
  name,
  options,
  placeholder,
  rules
}: FormSelect<T>) => (
  <Form.Item label={label} name={name as string} rules={rules}>
    <Select
      allowClear
      disabled={isDisabled}
      mode="multiple"
      options={options}
      placeholder={placeholder}
    />
  </Form.Item>
)
