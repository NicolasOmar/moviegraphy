import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { describe, expect, it, vi } from 'vitest'

import { ReactFormDatePicker } from './index'

type TestFormValues = {
  bornDate: string
}

const renderWithForm = (
  onValuesChange: (changedValues: object, allValues: object) => void = vi.fn(),
  props: Partial<ComponentProps<typeof ReactFormDatePicker<TestFormValues>>> = {}
) => {
  const Wrapper = () => {
    const [form] = Form.useForm()

    return (
      <Form form={form} onValuesChange={onValuesChange}>
        <ReactFormDatePicker<TestFormValues> label="Born date" name="bornDate" {...props} />
      </Form>
    )
  }

  render(<Wrapper />)
}

describe('ReactFormDatePicker', () => {
  it('renders the given label as visible text', () => {
    renderWithForm()

    expect(screen.getByText('Born date')).toBeInTheDocument()
  })

  it('renders the given placeholder on the underlying input', () => {
    renderWithForm(undefined, { placeholder: 'Select a date' })

    expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument()
  })

  it('disables the input when isDisabled is true', () => {
    renderWithForm(undefined, { isDisabled: true })

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('wires a typed date to the form field identified by the given name', async () => {
    const onValuesChange = vi.fn()
    renderWithForm(onValuesChange)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), '2024-01-15{enter}')

    expect(onValuesChange).toHaveBeenCalledWith(
      { bornDate: expect.anything() },
      { bornDate: expect.anything() }
    )
  })
})
