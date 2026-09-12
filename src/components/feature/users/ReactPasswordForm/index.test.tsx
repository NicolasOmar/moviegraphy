import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactPasswordForm } from './index'

beforeEach(() => {
  $globalNotifications.set(null)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: true }), { status: 200 }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Old password'), 'currentPassword123')
  await user.type(screen.getByLabelText('New password'), 'brandNewPassword123')
  await user.type(screen.getByLabelText('Repeat new password'), 'brandNewPassword123')
}

describe('ReactPasswordForm', () => {
  it('updates the password: submits a POST request and resets the form on success', async () => {
    const user = userEvent.setup()
    render(<ReactPasswordForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.PASSWORDS,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({ content: 'Password updated', type: 'success' })
    )
    expect(screen.getByLabelText('Old password')).toHaveValue('')
  })

  it('shows an error message and keeps the form filled when the update fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Username or password is incorrect' }), {
        status: 400
      })
    )
    render(<ReactPasswordForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Username or password is incorrect',
        type: 'error'
      })
    )
    expect(screen.getByLabelText('Old password')).toHaveValue('currentPassword123')
  })

  it('shows a generic invalidation message and never calls fetch when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<ReactPasswordForm />)

    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Check the form messages',
        type: 'error'
      })
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('flags a mismatch between the new and repeated passwords and never calls fetch', async () => {
    const user = userEvent.setup()
    render(<ReactPasswordForm />)

    await user.type(screen.getByLabelText('Old password'), 'currentPassword123')
    await user.type(screen.getByLabelText('New password'), 'brandNewPassword123')
    await user.type(screen.getByLabelText('Repeat new password'), 'somethingElse123')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    expect(await screen.findAllByText('Both passwords do not match')).toHaveLength(1)
    expect(fetch).not.toHaveBeenCalled()
  })
})
