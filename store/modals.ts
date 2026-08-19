import { atom } from 'nanostores'

interface ModalModel {
  content: string
  onCancel?: () => void
  onOk?: () => void
  title?: string
}

export const $globalModal = atom<ModalModel | null>(null)

export const callModal = (_newModalObj: ModalModel) => {
  $globalModal.set(_newModalObj)
}

export const clearModal = () => {
  $globalModal.set(null)
}
