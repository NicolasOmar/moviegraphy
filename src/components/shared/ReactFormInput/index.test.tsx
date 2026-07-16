import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { describe, expect, it, vi } from 'vitest'

import ReactFormInput from './index'

const renderWithForm = (
  onValuesChange: (changedValues: object, allValues: object) => void = vi.fn()
) => {
  const Wrapper = () => {
    const [form] = Form.useForm()

    return (
      <Form form={form} onValuesChange={onValuesChange}>
        <ReactFormInput label="Name" name="name" />
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
})
