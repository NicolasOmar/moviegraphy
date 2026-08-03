import { $contextMessageList } from '@store/messages'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URL } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactUserForm } from './index'

beforeEach(() => {
  $contextMessageList.set(null)
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: 'Success!' }), { status: 200 }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const [user1] = userMocks
  await user.type(screen.getByLabelText('Username'), user1.name)
  await user.type(screen.getByLabelText('Email'), user1.email)
  await user.type(screen.getByLabelText('Password'), user1.password)
  await user.type(screen.getByLabelText('Repeat Password'), user1.password)
}

describe('ReactUserForm', () => {
  it('creates a user: submits a POST request and resets the form on success', async () => {
    const user = userEvent.setup()
    render(<ReactUserForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URL.USERS,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({ content: 'User created', type: 'success' })
    )
    expect(screen.getByLabelText('Username')).toHaveValue('')
  })

  it('shows an error message and keeps the form filled when creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'A user with this email already exists' }), {
        status: 409
      })
    )
    render(<ReactUserForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({
        content: 'A user with this email already exists',
        type: 'error'
      })
    )
    expect(screen.getByLabelText('Username')).toHaveValue(userMocks[0].name)
  })

  it('shows a generic invalidation message and never calls fetch when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<ReactUserForm />)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({
        content: 'Check the form messages',
        type: 'error'
      })
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('flags a mismatch between the password and repeat password fields and never calls fetch', async () => {
    const [user1] = userMocks
    const user = userEvent.setup()
    render(<ReactUserForm />)

    await user.type(screen.getByLabelText('Username'), user1.name)
    await user.type(screen.getByLabelText('Email'), user1.email)
    await user.type(screen.getByLabelText('Password'), user1.password)
    await user.type(screen.getByLabelText('Repeat Password'), 'somethingElse123')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findAllByText('Both passwords do not match')).toHaveLength(1)
    expect(fetch).not.toHaveBeenCalled()
  })
})
