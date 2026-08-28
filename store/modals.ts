import type { ReactFormProps } from '@base-components/ReactForm'

import { atom } from 'nanostores'

export interface FormModalModel<UserDefinedEntity> extends Omit<ConfigmModalModel, 'content'> {
  cancelText?: string
  dataToEdit?: UserDefinedEntity
  form: Omit<ReactFormProps<UserDefinedEntity>, 'formButtons'>
  okText?: string
}

interface ConfigmModalModel {
  content: string
  onCancel?: () => void
  onOk?: () => void
  title?: string
}

export const $globalConfirmModal = atom<ConfigmModalModel | null>(null)

export const callConfirmModal = (_newModalObj: ConfigmModalModel) => {
  $globalConfirmModal.set(_newModalObj)
}

export const closeConfirmModal = () => {
  $globalConfirmModal.set(null)
}

export const $globalFormModal = atom<FormModalModel<unknown> | null>(null)

export const callFormModal = <UserDefinedEntity>(_newFormObj: FormModalModel<UserDefinedEntity>) => {
  $globalFormModal.set(_newFormObj as FormModalModel<unknown>)
}

export const clearFormModal = () => {
  $globalFormModal.set(null)
}
