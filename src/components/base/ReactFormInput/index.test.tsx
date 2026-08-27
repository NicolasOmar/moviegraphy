import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { describe, expect, it, vi } from 'vitest'

import { ReactFormInput } from './index'

type TestFormValues = {
  name: string
  password: string
  releaseYear: number
}

const renderWithForm = (
  onValuesChange: (changedValues: object, allValues: object) => void = vi.fn(),
  props: Partial<ComponentProps<typeof ReactFormInput<TestFormValues>>> = {}
) => {
  const Wrapper = () => {
    const [form] = Form.useForm()

    return (
      <Form form={form} onValuesChange={onValuesChange}>
        <ReactFormInput<TestFormValues> label="Name" name="name" {...props} />
      </Form>
    )
  }

  render(<Wrapper />)
}

describe('ReactFormInput', () => {
  it('renders the given label as visible text', () => {
    renderWithForm()

    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('wires typed input to the form field identified by the given name', async () => {
    const onValuesChange = vi.fn()
    renderWithForm(onValuesChange)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), 'Amelie')

    expect(onValuesChange).toHaveBeenLastCalledWith({ name: 'Amelie' }, { name: 'Amelie' })
  })

  it('disables the input when isDisabled is true', () => {
    renderWithForm(undefined, { isDisabled: true })

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders a password input when type is "password"', () => {
    renderWithForm(undefined, { label: 'Password', name: 'password', type: 'password' })

    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('normalizes typed digits to a Number for type "number", leaving an emptied field as an empty string', async () => {
    const onValuesChange = vi.fn()
    renderWithForm(onValuesChange, {
      label: 'Year of release',
      name: 'releaseYear',
      type: 'number'
    })
    const user = userEvent.setup()
    const input = screen.getByLabelText('Year of release')

    await user.type(input, '1999')

    expect(onValuesChange).toHaveBeenLastCalledWith({ releaseYear: 1999 }, { releaseYear: 1999 })

    await user.clear(input)

    expect(onValuesChange).toHaveBeenLastCalledWith({ releaseYear: '' }, { releaseYear: '' })
  })
})
