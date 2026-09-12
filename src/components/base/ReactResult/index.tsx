import type { ResultStatusType } from 'antd/es/result'

import { Result } from 'antd'
import { type FC, type ReactNode } from 'react'

export interface ReactResultProps {
  extraContent?: ReactNode
  status?: ResultStatusType
  subTitle?: string
  title: string
}

export const ReactResult: FC<ReactResultProps> = ({
  extraContent,
  status = 'info',
  subTitle,
  title
}) => <Result extra={extraContent} status={status} subTitle={subTitle} title={title} />
