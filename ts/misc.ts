import type { ChangeEventHandler } from 'react'

export type CreateOrUpdateOne<T> = (_entity: T) => Promise<T>

export type DeleteOne = (id: string) => Promise<boolean>

export type FormInput<T> = {
  label: string
  name: keyof T
}

export type FormInputList<T> = Array<FormInput<T>>

export type GetMany<T> = () => Promise<T[]>

export type InputEventHandler = ChangeEventHandler<HTMLInputElement, HTMLInputElement>
