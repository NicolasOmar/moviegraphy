import type { InputEventHandler } from '@ts/misc'
import type { FC } from 'react'

import { Form, Input } from 'antd'

interface ReactInputProps {
  id?: string
  label?: string
  name?: string
  onChange?: InputEventHandler
  value?: number | string
}

const ReactInput: FC<ReactInputProps> = ({ id, label, name, onChange, value }) => {
  return (
    <Form.Item label={label} name={name}>
      <Input id={id} onChange={onChange} type={'text'} value={value} />
    </Form.Item>
  )
}

export default ReactInput
