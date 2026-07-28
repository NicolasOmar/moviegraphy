import { $contextMessageList } from '@store/messages'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URL, PAGE_URL } from '@ts/constants'
import { userMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactLoginForm } from './index'

const originalLocation = window.location

beforeEach(() => {
  $contextMessageList.set(null)
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: { success: true } }), { status: 200 })
      )
  )
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, href: '' },
    writable: true
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
    writable: true
  })
})

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const [user1] = userMocks
  await user.type(screen.getByLabelText('Username or Email'), user1.name)
  await user.type(screen.getByLabelText('Password'), user1.password)
}

describe('ReactLoginForm', () => {
  it('logs a user in: submits a POST request and redirects to the users page on success', async () => {
    const user = userEvent.setup()
    render(<ReactLoginForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URL.SESSIONS,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() => expect(window.location.href).toBe(PAGE_URL.USERS))
    expect($contextMessageList.get()).toEqual({ content: 'User logged', type: 'success' })
  })

  it('shows an error message and keeps the form filled when login fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Name or password is incorrect' }), { status: 400 })
    )
    render(<ReactLoginForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({
        content: 'Name or password is incorrect',
        type: 'error'
      })
    )
    expect(screen.getByLabelText('Username or Email')).toHaveValue(userMocks[0].name)
    expect(window.location.href).toBe('')
  })

  it('shows validation messages and never calls fetch when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<ReactLoginForm />)

    await user.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() =>
      expect(screen.getByText('Username or Email is required')).toBeInTheDocument()
    )
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
