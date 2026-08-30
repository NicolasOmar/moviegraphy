import type { UserLoginFormModel } from '@ts-types/entities'
import type { FormConfig } from '@ts-types/forms'
import type { FC } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { describe, expect, it, vi } from 'vitest'

import { type FormButtonProps, ReactForm, type ReactFormProps } from './index'

const formInputs: FormConfig<UserLoginFormModel> = [
  {
    config: {
      label: 'Username or Email',
      name: 'username',
      rules: [{ message: 'Username or Email is required', required: true }]
    },
    type: 'input'
  },
  {
    config: {
      label: 'Password',
      name: 'password',
      rules: [{ message: 'Password is required', required: true }],
      type: 'password'
    },
    type: 'input'
  }
]

const formButtons: FormButtonProps[] = [{ htmlType: 'submit', title: 'Log In', type: 'primary' }]

const Wrapper: FC<Partial<ReactFormProps<UserLoginFormModel>>> = props => {
  const [formInstance] = Form.useForm<UserLoginFormModel>()

  return (
    <ReactForm
      formButtons={formButtons}
      formInputs={formInputs}
      formInstance={formInstance}
      onSubmit={vi.fn()}
      onSubmitFailed={vi.fn()}
      {...props}
    />
  )
}

describe('ReactForm', () => {
  it('renders the given title when formTitle is provided', () => {
    render(<Wrapper formTitle="Welcome back" />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders no heading when formTitle is omitted', () => {
    render(<Wrapper />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders one field per entry in formInputs', () => {
    render(<Wrapper />)

    expect(screen.getByLabelText('Username or Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('disables every input and button while isLoading is true', () => {
    render(<Wrapper isLoading />)

    expect(screen.getByLabelText('Username or Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Log In' })).toBeDisabled()
  })

  it('calls onSubmit with the typed values once the form passes validation', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<Wrapper onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Username or Email'), 'neo')
    await user.type(screen.getByLabelText('Password'), 'wakeUpNeo123')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(onSubmit).toHaveBeenCalledWith({ password: 'wakeUpNeo123', username: 'neo' })
  })

  it('calls onSubmitFailed instead of onSubmit when a required field is left empty', async () => {
    const onSubmit = vi.fn()
    const onSubmitFailed = vi.fn()
    const user = userEvent.setup()
    render(<Wrapper onSubmit={onSubmit} onSubmitFailed={onSubmitFailed} />)

    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(onSubmitFailed).toHaveBeenCalled()
  })

  it('calls onValuesChange with the updated values when a field changes', async () => {
    const onValuesChange = vi.fn()
    const user = userEvent.setup()
    render(<Wrapper onValuesChange={onValuesChange} />)

    await user.type(screen.getByLabelText('Username or Email'), 'n')

    expect(onValuesChange).toHaveBeenCalledWith({ username: 'n' })
  })

  it('does not throw when a field changes and onValuesChange is omitted', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    await user.type(screen.getByLabelText('Username or Email'), 'n')

    expect(screen.getByLabelText('Username or Email')).toHaveValue('n')
  })

  it('renders a date picker for a "date" input and a radio group for a "radio" input', () => {
    type ActorLikeValues = { bornDate: string; genderId: string }
    const mixedInputs: FormConfig<ActorLikeValues> = [
      { config: { label: 'Born date', name: 'bornDate' }, type: 'date' },
      {
        config: {
          label: 'Gender',
          name: 'genderId',
          options: [{ label: 'Male', value: 'male-id' }]
        },
        type: 'radio'
      }
    ]
    const MixedWrapper: FC = () => {
      const [formInstance] = Form.useForm<ActorLikeValues>()

      return (
        <ReactForm
          formButtons={formButtons}
          formInputs={mixedInputs}
          formInstance={formInstance}
          onSubmit={vi.fn()}
        />
      )
    }
    render(<MixedWrapper />)

    expect(screen.getByLabelText('Born date')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Male' })).toBeInTheDocument()
  })

  it('renders nothing for a form input whose type does not match a known input kind', () => {
    type UnknownValues = { mystery: string }
    const unknownInputs = [
      { config: { label: 'Mystery', name: 'mystery' }, type: 'unknown' }
    ] as unknown as FormConfig<UnknownValues>
    const UnknownWrapper: FC = () => {
      const [formInstance] = Form.useForm<UnknownValues>()

      return (
        <ReactForm
          formButtons={formButtons}
          formInputs={unknownInputs}
          formInstance={formInstance}
          onSubmit={vi.fn()}
        />
      )
    }
    render(<UnknownWrapper />)

    expect(screen.queryByText('Mystery')).not.toBeInTheDocument()
  })
})
