import type { FC } from 'react'
import { Form, Input } from 'antd'
import type { InputEventHandler } from '@ts/misc'

interface ReactInputProps {
  id?: string
  name?: string
  value?: string | number
  label?: string
  onChange?: InputEventHandler
}

const ReactInput: FC<ReactInputProps> = ({ id, name, value, label, onChange }) => {
  return (
    <Form.Item name={name} label={label}>
      <Input id={id} value={value} type={'text'} onChange={onChange} />
    </Form.Item>
  )
}

export default ReactInput
