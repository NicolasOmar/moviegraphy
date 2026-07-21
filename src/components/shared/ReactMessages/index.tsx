import type { FC } from 'react'

import { $contextMessageList } from '@store/message'
import { message } from 'antd'

export const ReactMessages: FC = () => {
  const [addMessageToList, messageList] = message.useMessage()

  $contextMessageList.subscribe(_message => {
    addMessageToList.info(_message[0])
  })

  return messageList
}
