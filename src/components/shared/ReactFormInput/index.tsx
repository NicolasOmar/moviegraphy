import type { FC } from 'react'

import { Form, Input } from 'antd'

interface ReactInputProps {
  label?: string
  name?: string
}

const ReactFormInput: FC<ReactInputProps> = ({ label, name }) => {
  return (
    <Form.Item label={label} name={name}>
      <Input type={'text'} />
    </Form.Item>
  )
}

export default ReactFormInput
