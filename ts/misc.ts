import type { Rule } from 'antd/es/form'
import type { ChangeEventHandler } from 'react'

export type CreateOrUpdateOne<T> = (_entity: T) => Promise<T>

export type DeleteOne = (id: string) => Promise<boolean>

export type FormInput<T> = {
  label: string
  name: keyof T
  rules?: Rule[]
  type?: InputType
}

export type FormInputList<T> = Array<FormInput<T>>

export type GetMany<T> = () => Promise<T[]>

export type InputEventHandler = ChangeEventHandler<HTMLInputElement, HTMLInputElement>

export type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
