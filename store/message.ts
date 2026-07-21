import { atom } from "nanostores";

export const $contextMessageList = atom<string[]>([])

export const addMessageToContext = (newMessage: string) => {
  $contextMessageList.set([...$contextMessageList.get(), newMessage])
}