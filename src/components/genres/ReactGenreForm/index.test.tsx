import {
  $contextGenreList,
  $contextSelectedGenre,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $globalNotifications } from '@store/notifications'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URLS } from '@ts/constants'
import { genreMocks } from '@ts/mocks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReactGenreForm } from './index'

beforeEach(() => {
  $contextGenreList.set([])
  $contextSelectedGenre.set(null)
  $globalNotifications.set(null)
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
      expect($globalNotifications.get()).toEqual({ content: 'Genre created', type: 'success' })
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
      expect($globalNotifications.get()).toEqual({ content: 'Name already used', type: 'error' })
    )
    expect(screen.getByLabelText('Name')).toHaveValue('Sci-Fi')
  })

  it('shows the required-field validation message and never calls fetch when the name is empty', async () => {
    const user = userEvent.setup()
    render(<ReactGenreForm />)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('The name is required')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({
        content: 'Check the form messages',
        type: 'error'
      })
    )
  })

  it('updates a genre: pre-fills the form on selection, submits a PATCH request, updates the list, and clears the selection', async () => {
    const user = userEvent.setup()
    const [genreToEdit] = genreMocks
    render(<ReactGenreForm />)
    $contextGenreList.set([genreToEdit])

    act(() => {
      updateSelectedGenreOnContext(genreToEdit)
    })

    expect(await screen.findByLabelText('Name')).toHaveValue(genreToEdit.name)
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Science Fiction')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        API_URLS.GENRES,
        expect.objectContaining({ body: expect.any(FormData), method: 'PATCH' })
      )
    )
    expect($contextGenreList.get()).toEqual([{ ...genreToEdit, name: 'Science Fiction' }])
    expect($contextSelectedGenre.get()).toBeNull()
  })

  it('shows an error message and keeps the selection when an update fails', async () => {
    const user = userEvent.setup()
    const [genreToEdit] = genreMocks
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Update rejected' }), { status: 500 })
    )
    render(<ReactGenreForm />)
    $contextGenreList.set([genreToEdit])

    act(() => {
      updateSelectedGenreOnContext(genreToEdit)
    })

    expect(await screen.findByLabelText('Name')).toHaveValue(genreToEdit.name)
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect($globalNotifications.get()).toEqual({ content: 'Update rejected', type: 'error' })
    )
    expect($contextGenreList.get()).toEqual([genreToEdit])
    expect($contextSelectedGenre.get()).toEqual(genreToEdit)
  })
})
