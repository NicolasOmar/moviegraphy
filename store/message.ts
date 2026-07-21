import { atom } from "nanostores";

interface Message {
  content: string
  type: 'success' | 'warning' | 'error'
}

export const $contextMessageList = atom<Message | null>(null)

export const addMessageToContext = (newMessage: Message) => {
  $contextMessageList.set(newMessage)
}