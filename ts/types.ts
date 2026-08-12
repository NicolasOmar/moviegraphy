import type { Rule } from 'antd/es/form'
import type { ChangeEventHandler } from 'react'

/** Used for CREATE or UPDATE API methods
 *
 * @typeParam InputE - Data structure for database insert or update
 * @typeParam OuputE - Data structure that will return as a `Promise`
 * @returns A `Promise` in shape of `InputE` or `OuputE`
 */
export type CreateOrUpdateOne<InputE, OutputE = boolean> = (
  _entity: InputE
) => Promise<InputE | OutputE>

/** Used for DELETE API method
 *
 * @param _identifier - string identifier to select an specific registry
 * and deleted from the database
 * @returns A `Promise` in shape of a boolean
 */
export type DeleteOne = (_identifier: string) => Promise<boolean>

export type FormInput<T> = {
  label: string
  name: Extract<keyof T, string>
  rules?: Rule[]
  type?: InputType
}

export type FormInputList<T> = Array<FormInput<T>>

/** Used for GET API method. Focused on a list of elements/registries
 *
 * @typeParam InputE - Data structure for database query (could be a string
 * or an object for complex queries)
 * @typeParam OuputE - Output data structure list
 * @returns A `Promise` in shape of a list of `OuputE`
 */
export type GetMany<InputE = string, OutputE = boolean> = (finder: InputE) => Promise<OutputE[]>

/** Used for GET API method. Focused on a single element/registry
 *
 * @deprecated Use the `GetOne` type for future single Get requests
 *
 * @typeParam T - Data structure that will return as a `Promise`
 * @returns A `Promise` in shape of a single `T`
 */
export type GetManyOld<T> = () => Promise<T[]>

/** Used for GET API method. Focused on a single element/registry
 *
 * @typeParam InputE - Data structure for database query (could be a string
 * or an object for complex queries)
 * @typeParam OuputE - Output data structure
 * @returns A `Promise` in shape of a single `OuputE`
 */
export type GetOne<InputE = string, OutputE = boolean> = (finder: InputE) => Promise<OutputE>

//----------HANDLERS----------
export type InputEventHandler = ChangeEventHandler<HTMLInputElement, HTMLInputElement>

//----------INPUTS----------
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

//----------API----------
/** Error carrying an HTTP status code, so API endpoints can translate it into a Response without inspecting error internals. */
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = 'HttpError'
    this.status = status
  }
}
