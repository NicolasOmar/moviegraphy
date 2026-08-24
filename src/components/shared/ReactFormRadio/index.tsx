import type { FormRadioGroup } from '@ts/types'

import { Form, Radio } from 'antd'

export const ReactFormRadio = <T,>({
  initialValue,
  label,
  name,
  options,
  rules
}: FormRadioGroup<T>) => (
  <Form.Item initialValue={initialValue} label={label} name={name as string} rules={rules}>
    <Radio.Group options={options?.map(({ label, value }) => ({ label, value })) ?? []} />
  </Form.Item>
)
