import { atom } from 'nanostores'

interface NotificationModel {
  content: string
  type: 'error' | 'info' | 'success' | 'warning'
}

export const $globalNotifications = atom<NotificationModel | null>(null)

export const publishNotification = (newMessage: NotificationModel) => {
  $globalNotifications.set(newMessage)
}
