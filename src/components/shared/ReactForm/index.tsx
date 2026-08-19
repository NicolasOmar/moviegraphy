import type { FormConfig, FormInput, FormSelect } from '@ts/types'

import { Button, type ButtonProps, Flex, Form, type FormInstance, Typography } from 'antd'
import React, { useMemo } from 'react'

import { ReactFormInput } from '../ReactFormInput'
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
        return type === 'input' ? (
          <ReactFormInput
            isDisabled={isLoading}
            key={`user-form-${_inputIndex}`}
            {...(config as FormInput<T>)}
          />
        ) : (
          <ReactFormSelect key={`user-form-${_inputIndex}`} {...(config as FormSelect<T>)} />
        )
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
