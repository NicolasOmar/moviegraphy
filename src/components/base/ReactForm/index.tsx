import type { FormConfig, FormInput, FormRadioGroup, FormSelect } from '@ts-types/forms'

import { Button, type ButtonProps, Flex, Form, type FormInstance, Typography } from 'antd'
import React, { useMemo } from 'react'

import { ReactFormDatePicker } from '../ReactFormDatePicker'
import { ReactFormInput } from '../ReactFormInput'
import { ReactFormRadio } from '../ReactFormRadio'
import { ReactFormSelect } from '../ReactFormSelect'

export interface FormButton {
  children?: React.ReactNode
  htmlType: ButtonProps['htmlType']
  onClick?: ButtonProps['onClick']
  title?: string
  type: ButtonProps['type']
}

export interface ReactFormProps<T> {
  formButtons: FormButton[]
  formInputs: FormConfig<T>
  formInstance: FormInstance
  formTitle?: string
  isLoading?: boolean
  onSubmit: (submittedFormData: T) => void
  onSubmitFailed?: () => void
  onValuesChange?: (updatedValues: T) => void
  styles?: React.CSSProperties
}

export const ReactForm = <T,>({
  formButtons,
  formInputs,
  formInstance,
  formTitle,
  isLoading = false,
  onSubmit,
  onSubmitFailed,
  onValuesChange,
  styles
}: ReactFormProps<T>): React.ReactElement => {
  const memoizedInputs = useMemo(
    () =>
      formInputs.map(({ config, type }, _inputIndex) => {
        const inputKey = `user-form-${_inputIndex}`
        const customConfig = {
          ...config,
          isDisabled: isLoading
        }

        switch (type) {
          case 'date':
            return <ReactFormDatePicker key={inputKey} {...(customConfig as FormInput<T>)} />
          case 'input':
            return <ReactFormInput key={inputKey} {...(customConfig as FormInput<T>)} />
          case 'radio':
            return <ReactFormRadio key={inputKey} {...(customConfig as FormRadioGroup<T>)} />
          case 'select':
            return <ReactFormSelect key={inputKey} {...(customConfig as FormSelect<T>)} />
          default:
            return null
        }
      }),
    [formInputs, isLoading]
  )
  const memoizedButtons = useMemo(
    () => (
      <Form.Item>
        <Flex gap="medium">
          {formButtons.map((_buttonConfig, _buttonIndex) => {
            const buttonChild = React.isValidElement(_buttonConfig.children)
              ? _buttonConfig.children
              : _buttonConfig.title

            return (
              <Button
                disabled={isLoading}
                htmlType={_buttonConfig.htmlType}
                key={`button-form-${_buttonIndex}`}
                onClick={_buttonConfig.onClick}
                type={_buttonConfig.type}
              >
                {buttonChild}
              </Button>
            )
          })}
        </Flex>
      </Form.Item>
    ),
    [formButtons, isLoading]
  )

  return (
    <section>
      {formTitle ? (
        <Typography.Title style={{ textAlign: 'center' }}>{formTitle}</Typography.Title>
      ) : null}

      <Form
        form={formInstance}
        onFinish={onSubmit}
        onFinishFailed={onSubmitFailed}
        onValuesChange={(_, _updatedValues) =>
          onValuesChange ? onValuesChange(_updatedValues) : null
        }
        style={styles}
      >
        {memoizedInputs}

        {memoizedButtons}
      </Form>
    </section>
  )
}
