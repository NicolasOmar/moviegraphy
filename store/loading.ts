import { atom } from 'nanostores'

export const $contextLoading = atom<boolean>(false)

export const setLoadingSystemState = (newLoadingState: boolean) =>
  $contextLoading.set(newLoadingState)
