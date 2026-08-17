import { atom } from 'nanostores'

interface NotificationModel {
  content: string
  type: 'error' | 'info' | 'success' | 'warning'
}

export const $contextNotifications = atom<NotificationModel | null>(null)

export const publishNotification = (newMessage: NotificationModel) => {
  $contextNotifications.set(newMessage)
}
