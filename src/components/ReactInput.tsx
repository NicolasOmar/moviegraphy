import type { FC } from 'react'
import { Input } from 'antd'
import type { InputEventHandler } from '../ts/misc'

interface ReactInputProps {
  id?: string
  name?: string
  value?: string | number
  onChange?: InputEventHandler
}

const ReactInput: FC<ReactInputProps> = ({ id, name, value, onChange }) => {
  return <Input id={id} name={name} value={value} type={'text'} onChange={onChange} />
}

export default ReactInput
