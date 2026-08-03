import type { FormInputList } from '@ts/types'

import { Button, type ButtonProps, Flex, Form, type FormInstance, Typography } from 'antd'
import React, { useMemo } from 'react'

import ReactFormInput from '../ReactFormInput'

export interface ReactFormButtonProps {
  children?: React.ReactNode
  htmlType: ButtonProps['htmlType']
  title?: string
  type: ButtonProps['type']
}

export interface ReactFormProps<T> {
  formButtons: ReactFormButtonProps[]
  formInputs: FormInputList<T>
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
      formInputs.map((_inputConfig, _inputIndex) => (
        <ReactFormInput isDisabled={isLoading} key={`user-form-${_inputIndex}`} {..._inputConfig} />
      )),
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
