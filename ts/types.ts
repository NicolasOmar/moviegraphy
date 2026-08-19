import type { SelectProps } from 'antd'
import type { Rule } from 'antd/es/form'
import type { ChangeEventHandler } from 'react'

/** Used for `[CREATE]` or `[UPDATE]` API methods
 * @typeParam InputEntity - Data structure for database insert or update
 * @typeParam OutputEntity - Data structure that will the return value. `boolean` by default
 * @returns A `Promise` in shape of a `OutputEntity`
 */
export type CreateOrUpdateOne<InputEntity, OutputEntity = boolean> = (
  _entity: InputEntity
) => Promise<OutputEntity>

/** Used for `[DELETE]` API method
 * @param _identifier - string identifier to select an specific registry
 * and deleted from the database
 * @returns A `Promise` in shape of a boolean
 */
export type DeleteOne = (_identifier: string) => Promise<boolean>

/** Used to create an array of form input configuration objects
 * @typeParam ConfigEntity - Type / Entity / Model used to format type's children properties
 */
export type FormConfig<ConfigEntity> = Array<FormItemConfig<ConfigEntity>>

/** Used for text-based form inputs, includes a specific `type` definition
 * @typeParam ConfigEntity - Type / Entity / Model used to format type's parent properties
 */
export type FormInput<ConfigEntity> = FormInputBase<ConfigEntity> & {
  /** `[Optional]` Specifies the type of form input (text based). `text` as default value */
  type?: FormInputType
}

/** Common properties for any type of form input
 * @typeParam ConfigEntity - Type/Entity/Model used to format the input `name`
 */
export type FormInputBase<ConfigEntity> = {
  isDisabled?: boolean
  label: string
  name: Extract<keyof ConfigEntity, string>
  placeholder?: string
  rules?: Rule[]
}

/** Specifies the type of form input (text based) */
export type FormInputType =
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

/** Sets a configuration object, including its `type` and `config` (which is
 *  related to the type mentioned before)
 * @typeParam ConfigEntity - Type/Entity/Model used to format the `config` object
 */
export type FormItemConfig<ConfigEntity> = {
  config: FormInput<ConfigEntity> | FormSelect<ConfigEntity>
  type: 'input' | 'select'
}

/** Used for dropdown-based form inputs, includes a specific `options` property
 *  to populate the select
 * @typeParam ConfigEntity - Type/Entity/Model used to format type's parent properties
 */
export type FormSelect<ConfigEntity> = FormInputBase<ConfigEntity> & {
  /** `[Optional]` Default value(s) selected when the form first renders */
  initialValue?: SelectProps['value']
  options: SelectProps['options']
}

/** Used for `[GET]` API method. Focused on a list of elements/registries
 * @typeParam InputEntity - Data structure for database query (could be a string
 * or an object for complex queries). `string` by default
 * @typeParam OutputEntity - Output data structure list. `boolean` by default
 * @returns A `Promise` in shape of a list of `OutputEntity`
 */
export type GetMany<InputEntity = string, OutputEntity = boolean> = (
  _finder: InputEntity
) => Promise<OutputEntity[]>

/** Used for `[GET]` API method. Focused on a single element/registry
 * @typeParam InputEntity - Data structure for database query (could be a string
 * or an object for complex queries). `string` by default
 * @typeParam OutputEntity - Output data structure. `boolean` by default
 * @returns A `Promise` in shape of a single `OutputEntity`
 */
export type GetOne<InputEntity = string, OutputEntity = boolean> = (
  _finder: InputEntity
) => Promise<OutputEntity>

/** Used as not-custom input change handler. Needed for typescript and linter types */
export type InputEventHandler = ChangeEventHandler<HTMLInputElement, HTMLInputElement>

/** Error carrying an HTTP status code, so API endpoints can translate it into a Response without inspecting error internals. */
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = 'HttpError'
    this.status = status
  }
}
