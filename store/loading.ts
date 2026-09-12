import { atom } from 'nanostores'

export const $globalLoading = atom<boolean>(false)

export const setGlobalLoadingState = (_newLoadingState: boolean) =>
  $globalLoading.set(_newLoadingState)
