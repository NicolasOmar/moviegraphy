import type { FormInputList } from '@ts/types'

import { Button, type ButtonProps, Flex, Form, type FormInstance, Typography } from 'antd'
import React, { useMemo } from 'react'

import ReactFormInput from '../ReactFormInput'

export interface ReactFormButtonProps {
  htmlType: ButtonProps['htmlType']
  title: string
  type: ButtonProps['type']
}

export interface ReactFormProps<T> {
  formButtons: ReactFormButtonProps[]
  formInputs: FormInputList<T>
  formInstance: FormInstance
  formTitle?: string
  isLoading?: boolean
  onSubmit: (submittedFormData: T) => void
  onSubmitFailed: () => void
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
  styles
}: ReactFormProps<T>): React.ReactElement => {
  const memoizedInputs = useMemo(
    () =>
      formInputs.map((_inputConfig, _inputIndex) => (
        <ReactFormInput isDisabled={isLoading} key={`user-form-${_inputIndex}`} {..._inputConfig} />
      )),
    [formInputs, isLoading]
  )

  return (
    <section>
      {formTitle ? (
        <Typography.Title style={{ textAlign: 'center' }}>{formTitle}</Typography.Title>
      ) : null}

      <Form form={formInstance} onFinish={onSubmit} onFinishFailed={onSubmitFailed} style={styles}>
        {memoizedInputs}

        <Form.Item>
          <Flex gap="medium">
            {formButtons.map((_buttonConfig, _buttonIndex) => (
              <Button
                disabled={isLoading}
                htmlType={_buttonConfig.htmlType}
                key={`button-form-${_buttonIndex}`}
                type={_buttonConfig.type}
              >
                <a href="/users">{_buttonConfig.title}</a>
              </Button>
            ))}
          </Flex>
        </Form.Item>
      </Form>
    </section>
  )
}
