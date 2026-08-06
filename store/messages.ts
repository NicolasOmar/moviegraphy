import { atom } from 'nanostores'

interface Message {
  content: string
  type: 'error' | 'info' | 'success' | 'warning'
}

export const $contextMessageList = atom<Message | null>(null)

export const addMessageToContext = (newMessage: Message) => {
  $contextMessageList.set(newMessage)
}
