import type { FormRadioGroup } from '@ts-types/forms'

import { Form, Radio } from 'antd'

export const ReactFormRadio = <T,>({
  initialValue,
  isDisabled = false,
  label,
  name,
  options,
  rules
}: FormRadioGroup<T>) => (
  <Form.Item initialValue={initialValue} label={label} name={name as string} rules={rules}>
    <Radio.Group
      disabled={isDisabled}
      options={options?.map(({ label, value }) => ({ label, value })) ?? []}
    />
  </Form.Item>
)
