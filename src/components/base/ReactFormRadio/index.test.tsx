import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { describe, expect, it, vi } from 'vitest'

import { ReactFormRadio } from './index'

type TestFormValues = {
  genderId: string
}

const options = [
  { label: 'Male', value: 'male-id' },
  { label: 'Female', value: 'female-id' }
]

const renderWithForm = (
  onValuesChange: (changedValues: object, allValues: object) => void = vi.fn(),
  props: Partial<ComponentProps<typeof ReactFormRadio<TestFormValues>>> = {}
) => {
  const Wrapper = () => {
    const [form] = Form.useForm()

    return (
      <Form form={form} onValuesChange={onValuesChange}>
        <ReactFormRadio<TestFormValues>
          label="Gender"
          name="genderId"
          options={options}
          {...props}
        />
      </Form>
    )
  }

  render(<Wrapper />)
}

describe('ReactFormRadio', () => {
  it('renders the given label and one radio option per entry in options', () => {
    renderWithForm()

    expect(screen.getByText('Gender')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Male' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Female' })).toBeInTheDocument()
  })

  it('renders no radio options when options is omitted', () => {
    renderWithForm(undefined, { options: undefined })

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('selects the matching form value when a radio option is clicked', async () => {
    const onValuesChange = vi.fn()
    renderWithForm(onValuesChange)
    const user = userEvent.setup()

    await user.click(screen.getByRole('radio', { name: 'Female' }))

    expect(onValuesChange).toHaveBeenLastCalledWith(
      { genderId: 'female-id' },
      { genderId: 'female-id' }
    )
  })

  it('pre-selects the option matching initialValue', () => {
    renderWithForm(undefined, { initialValue: 'male-id' })

    expect(screen.getByRole('radio', { name: 'Male' })).toBeChecked()
  })

  it('disables every option when isDisabled is true', () => {
    renderWithForm(undefined, { isDisabled: true })

    expect(screen.getByRole('radio', { name: 'Male' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Female' })).toBeDisabled()
  })
})
