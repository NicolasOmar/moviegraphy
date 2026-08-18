import type { FormSelect } from '@ts/types'

import { Form, Select } from 'antd'

export const ReactFormSelect = <T,>({
  isDisabled,
  label,
  name,
  options,
  rules,
  values
}: FormSelect<T>) => (
  <Form.Item label={label} name={name as string} rules={rules}>
    <Select
      allowClear
      defaultValue={values}
      disabled={isDisabled}
      mode="multiple"
      options={options}
      // style={{ width: '100%' }}
      placeholder="Please select"
    />
  </Form.Item>
)
