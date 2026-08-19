import { $globalNotifications } from '@store/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactUserUpdateForm } from './index'

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
  await user.type(screen.getByLabelText('Name'), 'Trinity')
  await user.type(screen.getByLabelText('Username'), 'trinity')
}

describe('ReactUserUpdateForm', () => {
  it('updates the user: submits a PATCH request and shows a success message', async () => {
    const user = userEvent.setup()
    render(<ReactUserUpdateForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.USERS,
        expect.objectContaining({ body: expect.any(FormData), method: 'PATCH' })
      )
    )
    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'User correctly updated',
        type: 'success'
      })
    )
  })

  it('shows an error message and keeps the form filled when the update fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Username 'trinity' is already taken" }), {
        status: 400
      })
    )
    render(<ReactUserUpdateForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: "Username 'trinity' is already taken",
        type: 'error'
      })
    )
    expect(screen.getByLabelText('Username')).toHaveValue('trinity')
  })

  it('shows a generic invalidation message and never calls fetch when the required username is empty', async () => {
    const user = userEvent.setup()
    render(<ReactUserUpdateForm />)

    await user.type(screen.getByLabelText('Name'), 'Trinity')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Check the form messages',
        type: 'error'
      })
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
