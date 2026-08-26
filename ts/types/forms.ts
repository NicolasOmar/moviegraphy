import type { RadioProps, SelectProps } from 'antd'
import type { Rule } from 'antd/es/form'
import type { ChangeEventHandler } from 'react'

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
  config: FormInput<ConfigEntity> | FormRadioGroup<ConfigEntity> | FormSelect<ConfigEntity>
  type: 'date' | 'input' | 'radio' | 'select'
}

export type FormRadioGroup<ConfigEntity> = FormInputBase<ConfigEntity> & {
  initialValue?: RadioProps['value']
  options: SelectProps['options']
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

/** Used as not-custom input change handler. Needed for typescript and linter types */
export type InputEventHandler = ChangeEventHandler<HTMLInputElement, HTMLInputElement>
