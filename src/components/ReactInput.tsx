import type { ChangeEventHandler, FC } from 'react'
import { Input } from 'antd'

interface ReactInputProps {
  onChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement>
}

const ReactInput: FC<ReactInputProps> = ({ onChange }) => {
  return <Input onChange={onChange} />
}

export default ReactInput
