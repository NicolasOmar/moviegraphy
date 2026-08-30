import type { FC } from 'react'

import { $globalNotifications } from '@store/notifications'
import { notification } from 'antd'

export const ReactNotifications: FC = () => {
  const [publishNotification, messageList] = notification.useNotification()

  $globalNotifications.subscribe(_message => {
    if (_message) {
      publishNotification[_message.type]({
        description: _message.content,
        title: ''
      })
    }
  })

  return messageList
}
