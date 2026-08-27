import type { ResultStatusType } from 'antd/es/result'

import { Result } from 'antd'
import { type FC, type ReactNode } from 'react'

export interface ReactResultProps {
  extraContent?: ReactNode
  status?: ResultStatusType
  title: string
}

export const ReactResult: FC<ReactResultProps> = ({ extraContent, status = 'info', title }) => (
  <Result extra={extraContent} status={status} title={title} />
)
