import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { describe, expect, it, vi } from 'vitest'

import { ReactFormSelect } from './index'

type TestFormValues = {
  countries: string[]
}

const options = [
  { label: 'United States', value: 'us-id' },
  { label: 'France', value: 'fr-id' }
]

const renderWithForm = (
  onValuesChange: (changedValues: object, allValues: object) => void = vi.fn(),
  props: Partial<ComponentProps<typeof ReactFormSelect<TestFormValues>>> = {}
) => {
  const Wrapper = () => {
    const [form] = Form.useForm()

    return (
      <Form form={form} onValuesChange={onValuesChange}>
        <ReactFormSelect<TestFormValues>
          label="Countries"
          name="countries"
          options={options}
          {...props}
        />
      </Form>
    )
  }

  render(<Wrapper />)
}

describe('ReactFormSelect', () => {
  it('renders the given label and placeholder', () => {
    renderWithForm(undefined, { placeholder: 'Select countries' })

    expect(screen.getByText('Countries')).toBeInTheDocument()
    expect(screen.getByText('Select countries')).toBeInTheDocument()
  })

  it('disables the select when isDisabled is true', () => {
    renderWithForm(undefined, { isDisabled: true })

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('pre-selects the option matching initialValue', () => {
    renderWithForm(undefined, { initialValue: ['fr-id'] })

    expect(screen.getByText('France')).toBeInTheDocument()
  })

  it('selects the matching form value when an option is clicked', async () => {
    const onValuesChange = vi.fn()
    renderWithForm(onValuesChange)
    const user = userEvent.setup()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByTitle('France'))

    expect(onValuesChange).toHaveBeenLastCalledWith(
      { countries: ['fr-id'] },
      { countries: ['fr-id'] }
    )
  })

  it('allows clearing every selected option', async () => {
    const onValuesChange = vi.fn()
    renderWithForm(onValuesChange, { initialValue: ['fr-id'] })
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('close-circle', { selector: 'span' }))

    expect(onValuesChange).toHaveBeenLastCalledWith({ countries: [] }, { countries: [] })
  })
})
