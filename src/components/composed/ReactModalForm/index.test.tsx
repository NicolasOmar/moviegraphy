import type { FormConfig } from '@ts-types/forms'
import type { FC } from 'react'

import { $globalFormModal, callFormModal } from '@store/modals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactModalForm } from './index'

type TestFormValues = { name: string }

const formInputs: FormConfig<TestFormValues> = [
  {
    config: {
      label: 'Name',
      name: 'name',
      rules: [{ message: 'The name is required', required: true }]
    },
    type: 'input'
  }
]

interface WrapperProps {
  cancelText?: string
  okText?: string
  onCancel?: () => void
  onOk?: () => void
  onSubmit?: (values: TestFormValues) => void
}

const Wrapper: FC<WrapperProps> = ({ cancelText, okText, onCancel, onOk, onSubmit = vi.fn() }) => {
  const [formInstance] = Form.useForm<TestFormValues>()

  callFormModal<TestFormValues>({
    cancelText,
    form: { formInputs, formInstance, onSubmit },
    okText,
    onCancel,
    onOk,
    title: 'Edit Name'
  })

  return <ReactModalForm />
}

beforeEach(() => {
  $globalFormModal.set(null)
})

describe('ReactModalForm', () => {
  it('renders nothing while there is no modal on context', () => {
    render(<ReactModalForm />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the modal title, form fields and default button labels from context', () => {
    render(<Wrapper />)

    expect(screen.getByText('Edit Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('uses the given okText and cancelText for the form buttons instead of the defaults', () => {
    render(<Wrapper cancelText="Discard" okText="Save" />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument()
  })

  it('submits the typed values, calls onOk and clears the modal when Confirm is clicked with valid input', async () => {
    const user = userEvent.setup()
    const onOk = vi.fn()
    const onSubmit = vi.fn()
    render(<Wrapper onOk={onOk} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Sci-Fi')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onOk).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Sci-Fi' })
    await waitFor(() => expect($globalFormModal.get()).toBeNull())
  })

  it('clears the modal on Confirm without throwing when no onOk callback was provided', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Wrapper onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Sci-Fi')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Sci-Fi' })
    await waitFor(() => expect($globalFormModal.get()).toBeNull())
  })

  it('keeps the modal open and never calls onSubmit when a required field is left empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Wrapper onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('The name is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    expect($globalFormModal.get()).not.toBeNull()
  })

  it('resets the fields, calls onCancel and clears the modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<Wrapper onCancel={onCancel} />)

    await user.type(screen.getByLabelText('Name'), 'Sci-Fi')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
    await waitFor(() => expect($globalFormModal.get()).toBeNull())
  })

  it('clears the modal on Cancel without throwing when no onCancel callback was provided', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect($globalFormModal.get()).toBeNull())
  })
})
