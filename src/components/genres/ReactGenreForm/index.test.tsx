import { $contextMessageList } from '@store/messages'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactGenreForm } from './index'

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

describe('ReactGenreForm', () => {
  it('creates a genre: submits a POST request and shows a success message', async () => {
    const user = userEvent.setup()
    render(<ReactGenreForm />)

    await user.type(screen.getByLabelText('Name'), 'Sci-Fi')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.GENRES,
        expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
      )
    )
    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({ content: 'Genre created', type: 'success' })
    )
  })

  it('shows an error message and keeps the form filled when creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Name already used' }), { status: 500 })
    )
    render(<ReactGenreForm />)

    await user.type(screen.getByLabelText('Name'), 'Sci-Fi')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect($contextMessageList.get()).toEqual({ content: 'Name already used', type: 'error' })
    )
    expect(screen.getByLabelText('Name')).toHaveValue('Sci-Fi')
  })

  it('shows the required-field validation message and never calls fetch when the name is empty', async () => {
    const user = userEvent.setup()
    render(<ReactGenreForm />)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('The name is required')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
    expect($contextMessageList.get()).toBeNull()
  })
})
